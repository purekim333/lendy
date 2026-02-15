import { fetchWithAccess } from "../util/fetchUtil";

export interface UserResponse {
    username: string;
    social: boolean;
    nickname: string;
    email: string;
}

export async function getUser(): Promise<UserResponse> {
    const response = await fetchWithAccess("/user");
    // 403/401 are handled by fetchWithAccess (redirect to login) or throw error
    const data = await response.json();
    return data;
}
