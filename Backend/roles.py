from fastapi import HTTPException


def require_role(*allowed_roles):

    def role_checker(current_user):

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission"
            )

        return current_user

    return role_checker