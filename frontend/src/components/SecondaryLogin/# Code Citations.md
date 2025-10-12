# Code Citations

## License: Apache_2_0

https://github.com/prisma/prisma-examples/tree/766569d0085c4f70836e63f6589b3804c10c7fa2/typescript/graphql-auth/prisma/schema.prisma

```
client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  password    String
  name        String?
```
