class AppError(Exception):
    def __init__(self, detail: str, status_code: int):
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, detail: str = "Not found"):
        super().__init__(detail=detail, status_code=404)


class ForbiddenError(AppError):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(detail=detail, status_code=403)


class ConflictError(AppError):
    def __init__(self, detail: str = "Conflict"):
        super().__init__(detail=detail, status_code=409)

