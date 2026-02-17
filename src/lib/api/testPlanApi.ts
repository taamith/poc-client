import axios from 'axios';

// Dedicated API client for test plan operations (AWS Lambda endpoints)
const testPlanApiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface TestPlanResponse {
    key: string;
    content: string; // JSON string containing the plan
}

export interface UpdateTestPlanRequest {
    name: string;
    content: {
        plan: string;
    };
}

export interface UpdateTestPlanResponse {
    message: string;
    s3_key: string;
}

export const testPlanApi = {
    /**
     * Fetch a test plan from AWS Lambda
     * @param filename - The test plan filename (e.g., "lead-creation-and-conversion.json")
     */
    fetchTestPlan: async (filename: string): Promise<TestPlanResponse> => {
        const url = `https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/read-test-plan?name=${encodeURIComponent(filename)}`;
        const response = await testPlanApiClient.get<TestPlanResponse>(url);
        return response.data;
    },

    /**
     * Update a test plan via AWS Lambda
     * @param filename - The test plan filename
     * @param content - The updated plan content
     */
    updateTestPlan: async (filename: string, planContent: string): Promise<UpdateTestPlanResponse> => {
        const url = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/update-test-plan';
        const payload: UpdateTestPlanRequest = {
            name: filename,
            content: {
                plan: planContent,
            },
        };
        const response = await testPlanApiClient.put<UpdateTestPlanResponse>(url, payload);
        return response.data;
    },

    /**
     * Publish a test plan to Confluence
     * @param testCaseFilename - The test plan filename
     * @param spaceId - Confluence space ID (default: 393220)
     */
    publishTestPlan: async (testCaseFilename: string, spaceId: number = 393220): Promise<{ message: string }> => {
        const url = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/publish-test-plan';
        const response = await testPlanApiClient.post<{ message: string }>(url, {
            space_id: spaceId,
            test_case_filename: testCaseFilename,
        });
        return response.data;
    },
};

export default testPlanApi;
