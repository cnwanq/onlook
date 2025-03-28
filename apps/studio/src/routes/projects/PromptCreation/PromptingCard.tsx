import { useProjectsManager } from '@/components/Context';
import { ProjectTabs } from '@/lib/projects';
import { compressImage } from '@/lib/utils';
import { MessageContextType, type ImageMessageContext } from '@onlook/models/chat';
import { Button } from '@onlook/ui/button';
import { CardContent, CardHeader } from '@onlook/ui/card';
import { Icons } from '@onlook/ui/icons';
import { MotionCard } from '@onlook/ui/motion-card';
import { Textarea } from '@onlook/ui/textarea';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@onlook/ui/tooltip';
import { cn } from '@onlook/ui/utils';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { DraftImagePill } from '../../editor/EditPanel/ChatTab/ContextPills/DraftingImagePill';

export const PromptingCard = () => {
    const projectsManager = useProjectsManager();
    const { ref: diffRef, height: diffHeight } = useResizeObserver();
    const [inputValue, setInputValue] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImages, setSelectedImages] = useState<ImageMessageContext[]>([]);
    const [imageTooltipOpen, setImageTooltipOpen] = useState(false);
    const [isHandlingFile, setIsHandlingFile] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isInputInvalid = !inputValue || inputValue.trim().length < 4;
    const [isComposing, setIsComposing] = useState(false);
    const imageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                projectsManager.projectsTab = ProjectTabs.PROJECTS;
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, []);

    const handleSubmit = async () => {
        if (isInputInvalid) {
            console.warn('Input is too short');
            return;
        }
        projectsManager.create.sendPrompt(inputValue, selectedImages, false);
    };

    const handleBlankSubmit = async () => {
        projectsManager.create.sendPrompt('', [], true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setImageTooltipOpen(false);
        // Find and reset the container's data attribute
        const container = e.currentTarget.closest('.bg-background-secondary');
        if (container) {
            container.setAttribute('data-dragging-image', 'false');
        }
        const files = Array.from(e.dataTransfer.files);
        handleNewImageFiles(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsHandlingFile(true);
        setImageTooltipOpen(false);
        const files = Array.from(e.target.files || []);
        handleNewImageFiles(files);
    };

    const handleNewImageFiles = async (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        const imageContexts: ImageMessageContext[] = [];
        if (imageFiles.length > 0) {
            // Handle the dropped image files
            for (const file of imageFiles) {
                const imageContext = await createImageMessageContext(file);
                if (imageContext) {
                    imageContexts.push(imageContext);
                }
            }
        }
        setSelectedImages([...selectedImages, ...imageContexts]);
        setIsHandlingFile(false);
    };

    const handleRemoveImage = (imageContext: ImageMessageContext) => {
        if (imageRef && imageRef.current) {
            imageRef.current.value = '';
        }
        setSelectedImages(selectedImages.filter((f) => f !== imageContext));
    };

    const createImageMessageContext = async (file: File): Promise<ImageMessageContext | null> => {
        try {
            const compressedImage = await compressImage(file);

            // If compression failed, fall back to original file
            const base64 =
                compressedImage ||
                (await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }));

            return {
                type: MessageContextType.IMAGE,
                content: base64,
                displayName: file.name,
                mimeType: file.type,
            };
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    };

    const handleDragStateChange = (isDragging: boolean, e: React.DragEvent) => {
        const hasImage =
            e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some(
                (item) =>
                    item.type.startsWith('image/') ||
                    (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')),
            );
        if (hasImage) {
            setIsDragging(isDragging);
            // Find the container div with the bg-background-secondary class
            const container = e.currentTarget.closest('.bg-background-secondary');
            if (container) {
                container.setAttribute('data-dragging-image', isDragging.toString());
            }
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        // Don't focus if clicking on a button, pill, or the textarea itself
        if (
            e.target instanceof Element &&
            (e.target.closest('button') ||
                e.target.closest('.group') || // Pills have 'group' class
                e.target === textareaRef.current)
        ) {
            return;
        }

        textareaRef.current?.focus();
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';

            const lineHeight = 20; // Approximate line height in pixels
            const maxHeight = lineHeight * 10; // 10 lines maximum

            const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    return (
        <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <div className="flex flex-col items-center gap-4 mb-12">
                <div className="flex flex-col gap-4 items-center">
                    <h2 className="text-5xl text-foreground-primary text-center font-timesNewerRoma-BoldItalic">
                        All-in-One Website Creation Platform
                    </h2>
                    <span className="text-center font-timesNewerRoma-Italic text-2xl w-[630px] text-[#1E1E1E]">
                        From design to launch, we provide comprehensive support to get your website
                        online effortlessly.
                    </span>
                </div>
                <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ height: diffHeight, opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={cn('w-[680px] overflow-hidden', isDragging && 'bg-background')}
                >
                    <motion.div ref={diffRef} layout="position" className="flex flex-col">
                        {/* <CardHeader>
                        </CardHeader> */}
                        <CardContent>
                            <div
                                className={cn(
                                    'flex flex-col gap-3 rounded-3xl p-0 mt-1 transition-colors duration-200 cursor-text',
                                    'bg-white/80 backdrop-blur border-white',
                                    '[&[data-dragging-image=true]]:bg-teal-500/40',
                                    isDragging && 'bg-teal-500/40 cursor-copy',
                                )}
                                onClick={handleContainerClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div
                                    className={`flex flex-col w-full ${selectedImages.length > 0 ? 'p-4 pt-6' : 'px-4 pt-1'}`}
                                >
                                    <div
                                        className={cn(
                                            'flex flex-row flex-wrap w-full gap-1.5 text-micro text-foreground-secondary',
                                            selectedImages.length > 0 ? 'min-h-10' : 'h-0',
                                        )}
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {selectedImages.map((imageContext, index) => (
                                                <DraftImagePill
                                                    key={`image-${index}-${imageContext.content}`}
                                                    context={imageContext}
                                                    onRemove={() => handleRemoveImage(imageContext)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <Textarea
                                        ref={textareaRef}
                                        className={cn(
                                            'mt-2 overflow-auto min-h-[60px] text-small p-0 border-0 shadow-none rounded-none caret-[#3C3C3C]',
                                            'selection:bg-[#3C3C3C]/30 selection:text-[#3C3C3C] text-foreground-primary',
                                            'placeholder:text-foreground-primary/50',
                                            'cursor-text',
                                            'transition-[height] duration-300 ease-in-out',
                                        )}
                                        placeholder="Please tell us as much as you can about your project..."
                                        value={inputValue}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            adjustTextareaHeight();
                                        }}
                                        onCompositionStart={() => setIsComposing(true)}
                                        onCompositionEnd={(e) => {
                                            setIsComposing(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDragStateChange(true, e);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDragStateChange(true, e);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (
                                                !e.currentTarget.contains(e.relatedTarget as Node)
                                            ) {
                                                handleDragStateChange(false, e);
                                            }
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDragStateChange(false, e);
                                            handleDrop(e);
                                        }}
                                        rows={3}
                                        style={{ resize: 'none' }}
                                    />
                                </div>
                                <div className="flex flex-row w-full justify-between pt-0 pb-2 px-2">
                                    <div className="flex flex-row justify-start gap-1.5">
                                        <Tooltip
                                            open={imageTooltipOpen && !isHandlingFile}
                                            onOpenChange={(open) =>
                                                !isHandlingFile && setImageTooltipOpen(open)
                                            }
                                        >
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 text-foreground-tertiary group hover:bg-transparent"
                                                    onClick={() =>
                                                        document
                                                            .getElementById('image-input')
                                                            ?.click()
                                                    }
                                                >
                                                    <input
                                                        id="image-input"
                                                        type="file"
                                                        ref={imageRef}
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={handleFileSelect}
                                                    />
                                                    <Icons.Image
                                                        className={cn(
                                                            'w-4 h-4',
                                                            'group-hover:text-foreground',
                                                        )}
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipPortal>
                                                <TooltipContent side="top" sideOffset={5}>
                                                    Upload Image Reference
                                                </TooltipContent>
                                            </TooltipPortal>
                                        </Tooltip>
                                        <Button
                                            variant="outline"
                                            className="w-fit h-fit py-0.5 px-2.5 text-foreground-tertiary hidden"
                                        >
                                            <Icons.FilePlus className="mr-2" />
                                            <span className="text-smallPlus">File Reference</span>
                                        </Button>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className={cn(
                                                    'text-smallPlus w-8 h-8 py-2 px-2 rounded-full',
                                                    isInputInvalid
                                                        ? 'text-primary'
                                                        : 'bg-foreground-primary text-white hover:bg-foreground-hover',
                                                )}
                                                disabled={isInputInvalid}
                                                onClick={handleSubmit}
                                            >
                                                <Icons.ArrowUp
                                                    className={cn(
                                                        'w-3 h-3',
                                                        !isInputInvalid
                                                            ? 'text-background'
                                                            : 'text-foreground-primary',
                                                    )}
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent>
                                                Start building your site
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>
                </MotionCard>
                <Button
                    variant="outline"
                    className="w-fit mx-auto bg-background-secondary/90 text-sm  text-foreground-secondary rounded-full hover:border-none border-none shadow"
                    onClick={handleBlankSubmit}
                >
                    <Icons.Plus className="w-4 h-4 mr-2" /> Start from a blank page
                </Button>
            </div>
        </MotionConfig>
    );
};
