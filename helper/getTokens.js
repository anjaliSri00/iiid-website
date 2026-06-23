const getTokens = () => {
    if (typeof window !== "undefined") {
      const accessToken = JSON.parse(localStorage.getItem("accessToken") || "{}").value;
      const refreshToken = JSON.parse(localStorage.getItem("refreshToken") || "{}").value;
      return { accessToken, refreshToken };
    }
    return {};
  };
  export default getTokens;