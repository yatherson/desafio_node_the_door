export class DuplicatedUserLikeException extends Error {
    constructor(postId: string, userId: string) {
        super(`O usuário "${userId}" já registrou um like no post "${postId}".`);
        this.name = 'DuplicatedUserLike';
    }
}