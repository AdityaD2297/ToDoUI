import http from "./http";

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string;
};

export const loginApi = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>("/auth/login", payload);
    return response.data;
};

export const logoutApi = async (): Promise<void> => {
    await http.post("/auth/logout");
};
