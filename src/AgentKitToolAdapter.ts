/**
 * AgentKit 2.0 Tool Adapter for OpenClaw
 * Converts OpenClaw's legacy SKILL.md definitions into structured AgentKit 2.0 JSON schemas.
 */
export class AgentKitToolAdapter {
    
    constructor() {}

    /**
     * Converts a raw string prompt or legacy skill config into a strict JSON schema.
     * This guarantees that symbols like '#', '---', and multi-line strings are safely encoded,
     * completely eliminating CLI parsing errors (400 INVALID_ARGUMENT).
     */
    public transformToAgentKitSchema(rawTask: Record<string, any>): object {
        const schema = {
            protocol: "AgentKit/2.0",
            timestamp: new Date().toISOString(),
            task_context: {
                repository: rawTask.repo || "local_workspace",
                working_directory: rawTask.cwd || process.cwd()
            },
            instruction_payload: {
                raw_text: rawTask.prompt || "",
                // Base64 encode the prompt to ensure ZERO character escaping issues in transit
                encoded_text: Buffer.from(rawTask.prompt || "").toString('base64'),
                complexity_score: this.calculateComplexity(rawTask.prompt || "")
            },
            execution_constraints: {
                timeout_ms: 300000,
                allow_file_writes: true,
                require_approval: false
            }
        };

        return schema;
    }

    private calculateComplexity(prompt: string): number {
        return prompt.length > 200 ? 0.9 : 0.3;
    }
}
