import router from '../router';

export function useCommon() {
  const goHomePage = () => {
    router.push('/');
  };

  return {
    goHomePage,
  };
}
