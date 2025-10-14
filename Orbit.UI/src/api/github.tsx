import { axiosInstance } from "./config";

const controller = "/github";

export class Github {
    static Login() {
        window.location.href = `${axiosInstance.defaults.baseURL}${controller}/login`;
    }
    static Repos() {
        return axiosInstance.get(`${controller}/repos`, { withCredentials: true });
    }

    // static RepoByName(name: string) {
    //     return axiosInstance.get(`${controller}/repos/${name}`);
    // }
}
