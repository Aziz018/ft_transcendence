export const userRegisterSchema = {
  tags: ["users"],
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        minLength: 3,
      },
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        minLength: 6,
        errorMessage: "password too weak",
      },
    },
    errorMessage: "The body must have name, email, and a strong password",
    additionalProperties: false,
  },
  response: {
    201: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        access_token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            createdAt: { type: "string" },
          },
        },
      },
    },
  },
};

export const userLoginSchema = {
  tags: ["users"],
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        minLength: 6,
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        access_token: { type: "string" },
        refresh_token: { type: "string" },
        uid: { type: "string" },
        message: { type: "string" },
      },
      // properties: {
      //     uid: { type: 'string' },
      //     message: { type: 'string' }
      // }
    },
    404: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        message: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

export const userProfileSchema = {
  tags: ["users"],
  response: {
    200: {
      type: "object",
      properties: {
        uid: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        avatar: { type: "string" },
        xp: { type: "number" },
        createdAt: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export const userProfileUpdateSchema = {
  tags: ["users"],
  body: {
    type: "object",
    properties: {
      field: {
        type: "string",
        enum: ["name", "avatar", "xp", "email", "password"],
      },
      value: { type: "string" },
      oldPassword: { type: "string" },
    },
    required: ["field", "value"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
  },
};

export const userLogoutSchema = {
  tags: ["users"],
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    400: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        error: { type: "string" },
        message: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};
