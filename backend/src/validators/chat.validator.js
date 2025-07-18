import Joi from 'joi';

export function validateGetMessages(body) {
  const schema = Joi.object({
    room_id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateSendMessage(body) {
  const schema = Joi.object({
    content: Joi.string().min(1).required(),
    room_id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateCreateRoom(body) {
  const schema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string(),
    class: Joi.string().hex().length(24).optional().allow(null),
  });
  return schema.validate(body);
}

export function validateDeleteRoom(body) {
  const schema = Joi.object({
    room_id: Joi.string().min(1).required(),
  });
  return schema.validate(body);
}

export function validateUpdateRoom(body) {
  const schema = Joi.object({
    room_id: Joi.string().min(1).required(),
    name: Joi.string().min(1).required(),
    description: Joi.string().required(),
    // classId is not allowed to be updated
  });
  return schema.validate(body);
}

export function validatePredict(body) {
  const schema = Joi.object({
    room_id: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
  });
  return schema.validate(body);
}
