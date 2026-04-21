import router from '../router';

export function useCommon() {
  const goHomePage = () => {
    router.push('/');
    router.go(0);
  };

  return {
    goHomePage,
  };
}
