import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import AuthenticationService from '../services/authentication.service';
import { IUser } from '../models/user.model';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.post(
  '',
  passport.authenticate('local', {
    session: false,
    failureRedirect: '/login',
  }),
  async (req, res) => {
    res.status(200).json({
      token: await AuthenticationService.generateToken(req.user as IUser),
    });
  }
);

export default router;
