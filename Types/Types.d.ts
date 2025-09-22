export interface Data {
    id: string,
    table: string,
    path?: string,
    redirect?: string
}

export interface Update {
    method: "GET" | "INSERT" | "DELETE" | "TABLE"
    data: Data
}

export interface UrlRow {
    id: string,
    path: string,
    redirect: string,
    created_at: string,
    expires_at: string
}

export type Row<T= any> = T[];

export interface LogData {
    message: string,
    level?: "info" | "warn" | "error",
    logToConsole?: boolean
    dir?: string | string[]
}