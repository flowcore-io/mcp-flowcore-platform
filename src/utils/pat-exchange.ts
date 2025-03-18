import { FlowcoreClient, SecurityExchangePATCommand } from "@flowcore/sdk"
import { jwtDecode } from "jwt-decode"

let token: string | null = null

const publicClient = new FlowcoreClient({
  getBearerToken: async () => null,
})

export const exchangePat = async (username: string, pat: string) => {
  if (token) {
    // check if token is not expired
    const decodedToken = jwtDecode(token)
    if (!(decodedToken.exp && decodedToken.exp < Date.now() / 1000)) {
      return token
    }
  }

  try {
    const result = await publicClient.execute(new SecurityExchangePATCommand({ username, pat }))
    token = result.accessToken

    if (!token) {
      throw new Error(`Failed to exchange PAT for user ${username}`)
    }

    return token
  } catch (error) {
    throw new Error(`Failed to exchange PAT for user ${username} with error ${error}`)
  }
}
