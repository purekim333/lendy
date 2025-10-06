import React from "react";
import kakaoIcon from "../assets/login/kakao.png";
import googleIcon from "../assets/login/google.png";
import naverIcon from "../assets/login/naver.png";
import appleIcon from "../assets/login/apple.png";
import facebookIcon from "../assets/login/facebook.png";

const BACKEND_API_BASE_URL = process.env.REACT_APP_BACKEND_API_BASE_URL

export default function Login() {

    const handleSocialLogin = (provider: String) => {
        window.location.href = `${BACKEND_API_BASE_URL}/oauth2/authorization/${provider}`
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* 로고 */}
      <h1 className="text-5xl font-serif mb-8">LENDY</h1>
      <p className="text-gray-600 text-center mb-20">
        오늘의 옷을 경험하고 구매하는 서비스 <br />
        Lendy의 방문을 환영합니다
      </p>

      {/* 카카오 로그인 */}
      <button className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#FEE500] rounded-md py-3 font-medium text-black mb-4">
        <img src={kakaoIcon} alt="Kakao" className="w-5 h-5" />
        Kakao로 시작하기
      </button>

      {/* 구글 로그인 */}
      <button onClick={() => handleSocialLogin("google")} className="w-full max-w-xs flex items-center justify-center gap-2 border rounded-md py-3 font-medium text-gray-700 mb-14">
        <img src={googleIcon} alt="Google" className="w-5 h-5" />
        Google로 시작하기
      </button>

      {/* 하단 아이콘 로그인 */}
      <div className="flex items-center gap-6 mb-20">
        <button onClick={() => handleSocialLogin("naver")}>
          <img src={naverIcon} alt="Naver" className="w-10 h-10" />
        </button>
        <button>
          <img src={appleIcon} alt="Apple" className="w-10 h-10" />
        </button>
        <button>
          <img src={facebookIcon} alt="Facebook" className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
}
