import { Response } from 'express'

const json: (res: Response, data: any, status?: number) => void = (
    res,
    data,
    status = 200,
): void => {
    res.status(status).json(data)
}

const jsonError: (res: Response, message: string, status?: number, details?: any) => void = (
    res,
    message,
    status = 500,
    details,
) => {
    const errorResponse: any = { message }
    if (details) {
        errorResponse.details = details
    }
    res.status(status).json(errorResponse)
}

const view: (res: Response, html: string) => void = (res, html) => {
    res.send(html)
}

export const response: {
    json: typeof json
    error: typeof jsonError
    view: typeof view
} = {
    json,
    error: jsonError,
    view,
}
