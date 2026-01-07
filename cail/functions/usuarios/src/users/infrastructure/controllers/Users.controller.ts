import { Response } from 'express';
import { FirestoreAccountRepository } from '../../../auth/infrastructure/repositories/FirestoreAccountRepository';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { UserId } from '../../../shared/domain/value-objects/UserId';

const accountRepository = new FirestoreAccountRepository();

/**
 * GET /users/profile
 * Obtiene el perfil del usuario autenticado
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    return ApiResponse.success(res, account.toJSON());
});

/**
 * PUT /users/profile
 * Actualiza el perfil del usuario autenticado
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    // Actualizar campos permitidos
    if (req.body.nombreCompleto) {
        account.nombreCompleto = req.body.nombreCompleto;
    }
    if (req.body.telefono) {
        account.telefono = req.body.telefono;
    }
    if (req.body.candidateProfile) {
        account.candidateProfile = {
            ...account.candidateProfile,
            ...req.body.candidateProfile
        };
    }
    if (req.body.employerProfile) {
        account.employerProfile = {
            ...account.employerProfile,
            ...req.body.employerProfile
        };
    }

    await accountRepository.save(account);

    return ApiResponse.success(res, account.toJSON(), 'Profile updated successfully');
});

/**
 * GET /users/:id
 * Obtiene un usuario por ID (para comunicación entre servicios)
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const account = await accountRepository.findById(new UserId(id));
    if (!account) {
        throw new AppError(404, 'User not found');
    }

    return ApiResponse.success(res, account.toJSON());
});
