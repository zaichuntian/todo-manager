import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/response';

export const checkOwnership = (model: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params;
    const userUuid = req.user!.uuid;

    const resource = await model.findOne({
      where: { uuid, isDeleted: 1 },
    });

    if (!resource) {
      return res.json(fail('资源不存在'));
    }

    if (resource.userUuid !== userUuid) {
      return res.json(fail('无权限操作他人资源'));
    }

    next();
  };
};
