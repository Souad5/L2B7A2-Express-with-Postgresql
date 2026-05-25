export declare const IssueService: {
    createIssue: (title: string, description: string, type: string, reporterId: number) => Promise<any>;
    getAllIssues: (sort: string, type?: string, status?: string) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: unknown;
        created_at: any;
        updated_at: any;
    }[]>;
    getSingleIssue: (id: number) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }>;
    updateIssue: (id: number, body: Record<string, unknown>) => Promise<{
        updatedIssue: any;
        existingIssue: any;
    }>;
    deleteIssue: (id: number) => Promise<void>;
};
//# sourceMappingURL=issue.service.d.ts.map