/**
 * 间隔槽
 * @param bgColor // transparent
 * @param height  // 20
 * @param marginTop // 0
 * @param marginBottom // 0
 * @returns
 */
interface GapProps {
  bgColor?: string;
  height?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  className?: string;
}

const UGap: React.FC<GapProps> = (props) => {
  const { bgColor = 'transparent', height = '10', marginTop, marginBottom } = props;
  return (
    <div
      className={props.className}
      style={{ background: bgColor, height, marginTop, marginBottom }}
    ></div>
  );
};

export default UGap;
