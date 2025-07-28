/**
 * @param top 滑动到顶距离
 */
export const backScrollTop = (top?: number) => {
  setTimeout(() => {
    window.scrollTo({
      top: top || 0,
      behavior: 'smooth',
    });
  }, 200);
};
