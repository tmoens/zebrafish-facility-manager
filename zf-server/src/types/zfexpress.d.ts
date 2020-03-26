/**
 * Hello boys and girls. This is yet another story in trying to make things work.
 * Today's scenario: I want to have a middleware to do this:
 * - Get a Request (any Request) with a bearer token and if it is a good bearer token
 *     a) put the calling user data into the request (like passport does). Why? Because you
 *        had to look the user up to do validation and downstream actions are almost
 *        certainly gonna want to know about the user.
 *     b) put a new fresh token in the response header, Why? So the user can keep her session
 *        alive while active.
 *
 * Seems normal enough.  WTF does this file have to do with that? I hear you cry. I almost did.
 *
 * First, I wanted to use the a NestJS Guard with a Passport jwt strategy just like in the nestjs
 * documentation. That easily solves sticking the user in the request. Passport does that.
 * But the Guard does not have access to the Response object so I could not put the fresh token there.
 *
 * So, ok, NestJS middleware is perfect because it gets access to both the request and the response.
 * Unfortunately NestJS middleware is in Typescript land and when you get a Request object (actually
 * an Express Request object) you cant just go an make up a "user" attribute and stuff something in
 * it: req.user = someUserObject;
 *
 * Solution found here: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
 * a) create this file (oh and by the way the essential import line was from one of the comments in the solution)
 * b) using another of the comments in the solution, add the following line to the tsconfig.json file
 *   "typeRoots": ["./src/types", "./node_modules/@types"]
 *
 * Now it all works just peachy. But really? Am I doing something really stupid? I assume so but god knows what.
 */

import {Express} from "express-serve-static-core";

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
  }
}
