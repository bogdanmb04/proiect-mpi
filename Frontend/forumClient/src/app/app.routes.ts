import { Routes } from '@angular/router';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { ProfilePage } from './components/profile-page/profile-page';
import { EditProfile } from './components/edit-profile/edit-profile';
import { Post } from './components/post/post';
import { EditPost } from './components/edit-post/edit-post';

export const routes: Routes = [
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Home
  },
  {
    path: 'profile/:id',
    component: ProfilePage
  },
  {
    path: 'profile/:id/edit',
    component: EditProfile
  },
  {
    path: 'post/:id',
    component: Post
  },
  {
    path: 'post/:id/edit',
    component: EditPost
  }
];
