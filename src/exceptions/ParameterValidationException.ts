
export class ParameterValidationException extends Error { 
    constructor(message: string, parameterName: string){
        super(`${parameterName}: ${message}`)
    }
}