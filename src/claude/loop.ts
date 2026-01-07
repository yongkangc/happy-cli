import { ApiSessionClient } from "@/api/apiSession"
import { MessageQueue2 } from "@/utils/MessageQueue2"
import { logger } from "@/ui/logger"
import { Session } from "./session"
import { claudeLocalLauncher } from "./claudeLocalLauncher"
import { claudeRemoteLauncher } from "./claudeRemoteLauncher"
import { ApiClient } from "@/lib"

export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';

export interface EnhancedMode {
    permissionMode: PermissionMode;
    model?: string;
    fallbackModel?: string;
    customSystemPrompt?: string;
    appendSystemPrompt?: string;
    allowedTools?: string[];
    disallowedTools?: string[];
}

/**
 * Map friendly model names to full Claude model identifiers
 * Allows users to use short names like "sonnet", "opus", "haiku"
 * Maps to latest Claude 4.5 models by default
 */
export function mapClaudeModel(modelName: string | undefined): string | undefined {
    if (!modelName) {
        return undefined;
    }

    // Return as-is if already a full model identifier
    if (modelName.startsWith('claude-')) {
        return modelName;
    }

    // Map friendly names to latest 4.5 versions
    switch (modelName.toLowerCase()) {
        case 'opus':
            return 'claude-opus-4-5-20251101';
        case 'sonnet':
            return 'claude-sonnet-4-5-20250929';
        case 'haiku':
            return 'claude-haiku-4-5-20251001';

        // Extended support for version-specific requests (4.5)
        case 'opus-4.5':
        case 'opus-4-5':
        case 'opus45':
            return 'claude-opus-4-5-20251101';
        case 'sonnet-4.5':
        case 'sonnet-4-5':
        case 'sonnet45':
            return 'claude-sonnet-4-5-20250929';
        case 'haiku-4.5':
        case 'haiku-4-5':
        case 'haiku45':
            return 'claude-haiku-4-5-20251001';

        // Legacy 4.x and 3.5 versions (for backwards compatibility)
        case 'opus-4':
        case 'opus4':
            return 'claude-opus-4-20250514';
        case 'sonnet-4':
        case 'sonnet4':
            return 'claude-sonnet-4-20250514';
        case 'sonnet-3.5':
        case 'sonnet-3-5':
        case 'sonnet35':
            return 'claude-sonnet-3-5-20241022';
        case 'haiku-3.5':
        case 'haiku-3-5':
        case 'haiku35':
            return 'claude-haiku-3-5-20241022';

        // If no mapping found, return as-is (might be a valid model identifier)
        default:
            return modelName;
    }
}

interface LoopOptions {
    path: string
    model?: string
    permissionMode?: PermissionMode
    startingMode?: 'local' | 'remote'
    onModeChange: (mode: 'local' | 'remote') => void
    mcpServers: Record<string, any>
    session: ApiSessionClient
    api: ApiClient,
    claudeEnvVars?: Record<string, string>
    claudeArgs?: string[]
    messageQueue: MessageQueue2<EnhancedMode>
    allowedTools?: string[]
    onSessionReady?: (session: Session) => void
    /** Path to temporary settings file with SessionStart hook (required for session tracking) */
    hookSettingsPath: string
}

export async function loop(opts: LoopOptions) {

    // Get log path for debug display
    const logPath = logger.logFilePath;
    let session = new Session({
        api: opts.api,
        client: opts.session,
        path: opts.path,
        sessionId: null,
        claudeEnvVars: opts.claudeEnvVars,
        claudeArgs: opts.claudeArgs,
        mcpServers: opts.mcpServers,
        logPath: logPath,
        messageQueue: opts.messageQueue,
        allowedTools: opts.allowedTools,
        onModeChange: opts.onModeChange,
        hookSettingsPath: opts.hookSettingsPath
    });

    // Notify that session is ready
    if (opts.onSessionReady) {
        opts.onSessionReady(session);
    }

    let mode: 'local' | 'remote' = opts.startingMode ?? 'local';
    while (true) {
        logger.debug(`[loop] Iteration with mode: ${mode}`);

        // Run local mode if applicable
        if (mode === 'local') {
            let reason = await claudeLocalLauncher(session);
            if (reason === 'exit') { // Normal exit - Exit loop
                return;
            }

            // Non "exit" reason means we need to switch to remote mode
            mode = 'remote';
            if (opts.onModeChange) {
                opts.onModeChange(mode);
            }
            continue;
        }

        // Start remote mode
        if (mode === 'remote') {
            let reason = await claudeRemoteLauncher(session);
            if (reason === 'exit') { // Normal exit - Exit loop
                return;
            }

            // Non "exit" reason means we need to switch to local mode
            mode = 'local';
            if (opts.onModeChange) {
                opts.onModeChange(mode);
            }
            continue;
        }
    }
}
