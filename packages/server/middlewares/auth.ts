import axios, { AxiosError } from 'axios'
import type { Request, Response, NextFunction } from 'express'
import { usersService } from '../api/users/service'

const API_YA_BASE = 'https://ya-praktikum.tech/api/v2'
const API_YA_AUTH_ENDPOINT = '/auth/user'

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user) next()

  const authCookie = req.cookies?.authCookie
  const uuid = req.cookies?.uuid

  if (!authCookie || !uuid) next()

  const cookies = `authCookie=${authCookie};uuid=${uuid}`

  try {
    const { data } = await axios.get(API_YA_BASE + API_YA_AUTH_ENDPOINT, {
      headers: {
        Cookie: cookies,
      },
    })
    console.log('axios')
    console.log({ data })
    res.locals.user = data
  } catch (error) {
    console.log(
      (error as AxiosError).message ?? 'server auth: failed get /auth/user api'
    )
    res.locals.user = null
  }

  if (res.locals?.user) {
    const data = res.locals.user
    try {
      const dbUser = await usersService.findOrCreate({
        authorIndex: data.id,
        author: data.display_name,
        userYandexId: data.id,
      })
      console.log({ dbUser })
    } catch (error) {
      console.error('server auth: failed to create or get user from db')
    }
  }

  next()
}
