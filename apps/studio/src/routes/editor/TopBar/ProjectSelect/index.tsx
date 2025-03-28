import { useEditorEngine, useProjectsManager, useRouteManager } from '@/components/Context';
import { ProjectTabs } from '@/lib/projects';
import { Route } from '@/lib/routes';
import { invokeMainChannel } from '@/lib/utils';
import { MainChannels } from '@onlook/models/constants';
import { Button } from '@onlook/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@onlook/ui/dropdown-menu';
import { Icons } from '@onlook/ui/icons';
import { cn } from '@onlook/ui/utils';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';

import arcoSMImg from '@/assets/arco.png';

const ProjectBreadcrumb = observer(() => {
    const editorEngine = useEditorEngine();
    const projectsManager = useProjectsManager();
    const routeManager = useRouteManager();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const closeTimeoutRef = useRef<Timer>();

    async function handleNavigateToProject(tab?: ProjectTabs) {
        try {
            await saveScreenshot();
        } catch (error) {
            console.error('Failed to take screenshot:', error);
        }
        setTimeout(() => {
            projectsManager.project = null;
            if (tab) {
                projectsManager.projectsTab = tab;
            }
            routeManager.route = Route.PROJECTS;
        }, 100);
    }

    async function handleReturn() {
        handleNavigateToProject();
    }

    const handleOpenProjectFolder = () => {
        const project = projectsManager.project;
        if (project && project.folderPath) {
            invokeMainChannel(MainChannels.OPEN_IN_EXPLORER, project.folderPath);
        }
    };

    async function saveScreenshot() {
        const project = projectsManager.project;
        if (!project) {
            console.error('No project selected');
            return;
        }
        const projectId = project.id;
        const result = await editorEngine.takeActiveWebviewScreenshot(projectId, {
            save: true,
        });
        if (!result || !result.name) {
            console.error('Failed to take screenshot');
            return;
        }
        project.previewImg = result.name;
        project.updatedAt = new Date().toISOString();
        projectsManager.updateProject(project);
    }

    return (
        <div className="mx-2 flex flex-row items-center text-small gap-2">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={'ghost'}
                        className="mx-0 px-0 gap-2 text-foreground-onlook text-small hover:text-foreground-active hover:bg-transparent"
                    >
                        {/* <Icons.OnlookLogo className="w-6 h-6 hidden md:block" /> */}
                        <img
                            src={arcoSMImg}
                            className="w-6 h-6 hidden md:block ml-1"
                            alt="Arco Logo"
                        />
                        <span className="mx-0 max-w-[60px] md:max-w-[100px] lg:max-w-[200px] px-0 text-foreground-onlook text-small truncate cursor-pointer">
                            {projectsManager.project?.name}
                        </span>
                        <Icons.ChevronDown className="transition-all rotate-0 group-data-[state=open]:-rotate-180 duration-200 ease-in-out text-foreground-onlook " />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-48 rounded-2xl"
                    onMouseEnter={() => {
                        if (closeTimeoutRef.current) {
                            clearTimeout(closeTimeoutRef.current);
                        }
                    }}
                    onMouseLeave={() => {
                        closeTimeoutRef.current = setTimeout(() => {
                            setIsDropdownOpen(false);
                        }, 300);
                    }}
                >
                    <DropdownMenuItem onClick={handleReturn} className="rounded-xl">
                        <div className="flex row center items-center group">
                            <Icons.Tokens className="mr-2 group-hover:rotate-12 transition-transform" />
                            {'Go to all Projects'}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl">
                            New Project
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-2xl">
                            <DropdownMenuItem
                                onClick={() => handleNavigateToProject(ProjectTabs.PROMPT_CREATE)}
                                className={cn(
                                    'focus:bg-background-secondary hover:bg-background-secondary',
                                    'rounded-xl',
                                    // 'focus:bg-blue-100 focus:text-blue-900',
                                    // 'hover:bg-blue-100 hover:text-blue-900',
                                    // 'dark:focus:bg-blue-900 dark:focus:text-blue-100',
                                    // 'dark:hover:bg-blue-900 dark:hover:text-blue-100',
                                )}
                            >
                                <Icons.FilePlus className="mr-2 h-4 w-4" />
                                Start from scratch
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleNavigateToProject(ProjectTabs.IMPORT_PROJECT)}
                                className={cn(
                                    'focus:bg-background-secondary hover:bg-background-secondary',
                                    'rounded-xl',
                                    // 'focus:bg-teal-100 focus:text-teal-900',
                                    // 'hover:bg-teal-100 hover:text-teal-900',
                                    // 'dark:focus:bg-teal-900 dark:focus:text-teal-100',
                                    // 'dark:hover:bg-teal-900 dark:hover:text-teal-100',
                                )}
                            >
                                <Icons.Download className="mr-2 h-4 w-4" />
                                Import a project
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleOpenProjectFolder} className="rounded-xl">
                        {'Show in Explorer'}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                        onClick={() => {
                            editorEngine.isPlansOpen = true;
                        }}
                    >
                        Subscriptions
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem
                        onClick={() => {
                            editorEngine.isSettingsOpen = true;
                        }}
                    >
                        Settings
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
});

export default ProjectBreadcrumb;
