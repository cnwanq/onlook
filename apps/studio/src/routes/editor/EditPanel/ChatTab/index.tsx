import { observer } from 'mobx-react-lite';
import { ChatInput } from './ChatInput';
import ChatMessages from './ChatMessages';
import { ErrorView } from './ErrorView';

const ChatTab = observer(() => {
    return (
        <div className="w-full h-[calc(100vh-9.25rem)] flex flex-col justify-end gap-2">
            <ChatMessages />
            <ErrorView />
            <ChatInput />
        </div>
    );
});

export default ChatTab;
