import { useProjectsManager } from '@/components/Context';
import { invokeMainChannel } from '@/lib/utils';
import type { RunBunCommandResult } from '@onlook/models';
import { MainChannels } from '@onlook/models/constants';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

const BashCodeDisplay = observer(
    ({ content, isStream }: { content: string; isStream: boolean }) => {
        const projectsManager = useProjectsManager();
        const projectPath = projectsManager.project?.folderPath;
        const [running, setRunning] = useState(false);
        const [stdOut, setStdOut] = useState<string | null>(null);
        const [stdErr, setStdErr] = useState<string | null>(null);

        const runCommand = async () => {
            if (!projectPath) {
                console.error('No project path found');
                return;
            }
            setRunning(true);
            const res: RunBunCommandResult | null = await invokeMainChannel(
                MainChannels.RUN_COMMAND,
                {
                    cwd: projectPath,
                    command: content,
                },
            );
            if (!res || !res.success) {
                setStdErr(res?.error || 'Failed to run command');
            } else {
                setStdOut(res.output || '');
                setStdErr(null);
            }
            setRunning(false);
        };

        return (
            <div className="flex flex-col border rounded-lg bg-background w-full text-foreground">
                <div className="flex flex-col w-full h-full">
                    <div className="relative flex items-center p-4 text-xs w-full overflow-x-auto bg-background-secondary">
                        <span className="text-foreground-secondary select-none mr-2">$</span>
                        <code className="w-full">{content}</code>
                    </div>
                    {(stdOut !== null || stdErr !== null) && (
                        <div className="w-full h-[1px] bg-foreground-secondary/30"></div>
                    )}
                    {stdOut !== null && (
                        <code className="px-4 py-2 text-xs w-full overflow-x-auto bg-background-secondary">
                            {stdOut}
                        </code>
                    )}
                    {stdErr !== null && (
                        <code className="px-4 py-2 text-xs w-full overflow-x-auto bg-background-secondary text-red-500">
                            {stdErr}
                        </code>
                    )}
                </div>

                <div className="flex h-8 items-center">
                    {stdOut !== null ? (
                        <Button
                            size={'sm'}
                            className="flex flex-grow rounded-none gap-2 px-1 bg-foreground/10 text-foreground group-hover:bg-foreground/20 group-hover:text-foreground-secondary transition-none"
                            variant={'ghost'}
                            onClick={runCommand}
                            disabled={running || isStream}
                        >
                            {running ? (
                                <Icons.Shadow className="animate-spin" />
                            ) : (
                                <Icons.Reload className="text-foreground group-hover:text-foreground-secondary transition-none" />
                            )}
                            Run again
                        </Button>
                    ) : (
                        <Button
                            size={'sm'}
                            className="group flex flex-grow rounded-none gap-2 px-1 bg-[#007AFF]/20 text-[#007AFF] hover:bg-[#007AFF]/40 hover:text-[#007AFF]"
                            variant={'ghost'}
                            onClick={runCommand}
                            disabled={running || isStream}
                        >
                            {running ? (
                                <Icons.Shadow className="animate-spin" />
                            ) : (
                                <Icons.Play className="text-[#007AFF] group-hover:text-[#007AFF] transition-none" />
                            )}
                            Run command
                        </Button>
                    )}
                </div>
            </div>
        );
    },
);

export default BashCodeDisplay;
