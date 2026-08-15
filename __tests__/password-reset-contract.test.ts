import { AuthService } from "@/services/auth";
import { publicAxios } from "@/libs/axiosInstance";

jest.mock("@/libs/axiosInstance", () => ({
  __esModule: true,
  publicAxios: {
    get: jest.fn(),
    post: jest.fn().mockResolvedValue({
      data: { status: "Success", message: "Password Reset successful" },
    }),
  },
}));

jest.mock("@/store/use-auth-store", () => ({
  __esModule: true,
  default: {
    getState: () => ({ getOrCreateDeviceId: () => "test-device" }),
  },
}));

describe("mobile password reset contract", () => {
  it("posts the OTP and matching password fields without logging secrets", async () => {
    await AuthService.resetPassword("worker@example.test", {
      old_password: "123456",
      new_password: "Secure!2026",
      confirm_new_password: "Secure!2026",
    });

    expect(publicAxios.post).toHaveBeenCalledWith("/Account/reset_password", {
      Email: "worker@example.test",
      OTP: "123456",
      Password: "Secure!2026",
      ConfirmPassword: "Secure!2026",
    });
  });
});
