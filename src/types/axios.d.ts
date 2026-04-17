import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }

  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}