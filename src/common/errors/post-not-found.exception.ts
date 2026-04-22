export class PostNotFoundException extends Error {
    constructor(postId: string) {
        super(`O post com ID "${postId}" não foi encontrado.`);
        this.name = 'PostNotFound';
    }
}