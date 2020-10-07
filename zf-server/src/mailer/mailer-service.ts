import {Injectable} from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {User} from "../user/user.entity";
import {ConfigService} from "../config/config.service";

@Injectable()
export class ZFMailerService {
  constructor(
    private readonly  mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
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
        from: this.configService.gmailSender,
        subject: 'Zebrafish Facility Manager Password Reset', // Subject line
        html: `<p>Greetings ${user.username}: <\p>
          <p>As requested, your password has been changed.  Your new password is 
          <b>${newPassword}</b>. Use it to log in, and then to change your password to whatever you like.
          
          Regards,
          
          Zebrafish Facility Manager
          ${this.configService.facilityInfo.url}`
      })
      .then(() => {})
      .catch(() => {});
  }

  public newUser(user: User, newPassword: string): void {
    this
      .mailerService
      .sendMail({
        to: user.email,
        from: this.configService.gmailSender,
        subject: 'Welcome to Zebrafish Facility Manager', // Subject line
        html: `<p>Greetings ${user.username}: <\p>
          <p>Welcome to the Zebrafish facility manager for ${this.configService.facilityInfo.name}.
          <p>Login here: ${this.configService.facilityInfo.url}</p>
          <p>Your new userid is <b>${user.username}</b></p>
          <p>Your new password is:
          <b>${newPassword}</b>. You will be required to change it when you log in.
          
          <p>Regards,
          
          <p>Zebrafish Facility Manager`
      })
      .then(() => {})
      .catch(() => {});
  }

}
