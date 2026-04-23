import {ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException} from '@nestjs/common';
import { PostNotFoundException } from '../errors/post-not-found.exception';
import { DuplicatedUserLikeException } from '../errors/duplicated-user-like.exception';

@Catch(Error)
export class DomainErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger('HttpError');

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            response.status(status).json(body);
            return;
        }

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error.';

        if (exception instanceof PostNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = exception.message;
        }
        else if (exception instanceof DuplicatedUserLikeException) {
            status = HttpStatus.CONFLICT;
            message = exception.message;
        }

        this.logger.error(`[${exception.name}] - ${message}`);

        response.status(status).json({
            statusCode: status,
            error: exception.name,
            message: message,
            timestamp: new Date().toISOString(),
        });
    }
}