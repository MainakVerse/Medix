import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals"
import { signIn, signOut, auth, handlers } from "../auth"
import * as NextAuthModule from "next-auth"
import { Pool } from "@neondatabase/serverless"

jest.mock("next-auth")
jest.mock("@neondatabase/serverless")
jest.mock("next-auth/providers/google")

describe("auth.ts", () => {
  let mockPool: jest.Mocked<Pool>
  let mockQuery: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery = jest.fn()
    mockPool = {
      query: mockQuery,
    } as unknown as jest.Mocked<Pool>
    ;(Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => mockPool)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("NextAuth configuration", () => {
    it("should export handlers object from NextAuth", () => {
      expect(handlers).toBeDefined()
      expect(typeof handlers).toBe("object")
    })

    it("should export signIn function from NextAuth", () => {
      expect(signIn).toBeDefined()
      expect(typeof signIn).toBe("function")
    })

    it("should export signOut function from NextAuth", () => {
      expect(signOut).toBeDefined()
      expect(typeof signOut).toBe("function")
    })

    it("should export auth function from NextAuth", () => {
      expect(auth).toBeDefined()
      expect(typeof auth).toBe("function")
    })
  })

  describe("signIn callback", () => {
    let signInCallback: any

    beforeEach(() => {
      const mockNextAuth = NextAuthModule.default as jest.Mock
      mockNextAuth.mockImplementation((config: any) => {
        signInCallback = config.callbacks.signIn
        return {
          handlers: {},
          signIn: jest.fn(),
          signOut: jest.fn(),
          auth: jest.fn(),
        }
      })
      jest.resetModules()
      require("../auth")
    })

    it("should return false when user email is missing", async () => {
      const result = await signInCallback({ user: { name: "Test User" } })
      expect(result).toBe(false)
    })

    it("should return true when existing user logs in", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] })

      const result = await signInCallback({
        user: { email: "existing@example.com", name: "John Doe" },
      })

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenCalledWith("SELECT id FROM user_settings WHERE email = $1", [
        "existing@example.com",
      ])
    })

    it("should insert new user with email, first_name, and last_name", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

      const result = await signInCallback({
        user: { email: "newuser@example.com", name: "Jane Smith" },
      })

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenCalledTimes(2)
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_settings"), [
        "newuser@example.com",
        "Jane",
        "Smith",
      ])
    })

    it("should handle user name with single word", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

      const result = await signInCallback({
        user: { email: "single@example.com", name: "Madonna" },
      })

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_settings"), [
        "single@example.com",
        "Madonna",
        "",
      ])
    })

    it("should handle user name with multiple words", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

      const result = await signInCallback({
        user: { email: "multi@example.com", name: "Mary Jane Watson" },
      })

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_settings"), [
        "multi@example.com",
        "Mary",
        "Jane Watson",
      ])
    })

    it("should use default name 'User' when user name is missing", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

      const result = await signInCallback({
        user: { email: "noname@example.com" },
      })

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_settings"), [
        "noname@example.com",
        "User",
        "",
      ])
    })

    it("should return false when database query fails during user check", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database connection failed"))

      const result = await signInCallback({
        user: { email: "error@example.com", name: "Test User" },
      })

      expect(result).toBe(false)
    })

    it("should return false when database insert fails for new user", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error("Insert failed"))

      const result = await signInCallback({
        user: { email: "newuser@example.com", name: "Test User" },
      })

      expect(result).toBe(false)
    })

    it("should handle database timeout gracefully", async () => {
      const timeoutError = new Error("Query timeout")
      mockQuery.mockRejectedValueOnce(timeoutError)

      const result = await signInCallback({
        user: { email: "timeout@example.com", name: "Test User" },
      })

      expect(result).toBe(false)
    })
  })

  describe("session callback", () => {
    let sessionCallback: any

    beforeEach(() => {
      const mockNextAuth = NextAuthModule.default as jest.Mock
      mockNextAuth.mockImplementation((config: any) => {
        sessionCallback = config.callbacks.session
        return {
          handlers: {},
          signIn: jest.fn(),
          signOut: jest.fn(),
          auth: jest.fn(),
        }
      })
      jest.resetModules()
      require("../auth")
    })

    it("should attach user id from database to session", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] })