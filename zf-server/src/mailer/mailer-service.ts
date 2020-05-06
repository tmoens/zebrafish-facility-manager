import { Injectable } from '@nestjs/common';
import {MailerService, MailerOptions} from "@nestjs-modules/mailer";
import {User} from "../user/user.entity";

@Injectable()
export class ZFMailerService {
  constructor(private readonly  mailerService: MailerService) {
  }

  public example(): void {
    this
      .mailerService
      .sendMail({
        to: 'ted.moens@gmail.com', // list of receivers
        from: 'zebrafishfacilitymanager@gmail.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome to fiddlefaddle</b>', // HTML body content
      })
      .then(() => {})
      .catch(() => {});
  }

  public passwordReset(user: User, newPassword: string): void {
    this
      .mailerService
      .sendMail({
        to: user.email,
        from: 'zebrafishfacilitymanager@gmail.com',
        subject: 'Zebrafish Facility Manager Password Reset', // Subject line
        html: `<p>Greetings ${user.username}: <\p>
          <p>As requested, your password has been changed.  Your new password is 
          <b>${newPassword}</b>. Use it to log in, and then to change your password.
          
          Regards,
          
          Zebrafish Facility Manager
          and a website link to go here.`
      })
      .then(() => {})
      .catch(() => {});
  }

}
