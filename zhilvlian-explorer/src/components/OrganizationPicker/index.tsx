import { useState, forwardRef, useImperativeHandle } from 'react';
import { Popup, Field, Button, Picker } from 'react-vant';

interface OrganizationPickerProps {
  onChange?: (selected: string[]) => void; // 选择的组织
}

const OrganizationPickerComponent = forwardRef((props: OrganizationPickerProps, ref) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]); // 初始化为空数组

  const organizations = ["datamint", "financenet", "notarization", "upaypal", "yilvtong"];

  // 允许父组件调用的重置方法
  useImperativeHandle(ref, () => ({
    resetOrg() {
      setSelectedOrgs([]); // 重置为默认空数组
      props.onChange?.([]); // 通知父组件组织已重置
    }
  }));

  const handleConfirm = () => {
    setShowPicker(false);
    // 调用 onChange 传递选择的组织
    props.onChange?.(selectedOrgs); // 传递已选择的组织数组
  };

  const toggleOrganization = (org: string) => {
    setSelectedOrgs((prev) => {
      if (prev.includes(org)) {
        return prev.filter((o) => o !== org); // 如果已选择则移除
      } else {
        return [...prev, org]; // 否则添加
      }
    });
  };

  return (
    <div>
      {/* 组织选择器输入框 */}
      <Field
        className='list_org'
        label="筛选组织"
        value={selectedOrgs.length > 0 ? selectedOrgs.join(', ') : '请选择>'} // 显示已选择的组织
        onClick={() => setShowPicker(true)}
        readOnly
        clickable
        placeholder="请选择>"
      />

      {/* 组织选择器弹出层 */}
      <Popup
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        position="bottom"
        round
      >
        <div className='org'>
          {/* 顶部显示：取消、筛选组织、确认 */}
          <div className='popupTop' style={{ display: 'flex', justifyContent: 'space-between'}}>
            <Button plain onClick={() => setShowPicker(false)}>取消</Button>
            <span className='popupTitle' style={{ alignSelf: 'center' }}>筛选组织</span>
            <Button plain onClick={handleConfirm}>确认</Button>
          </div>

          {/* 组织选择器 */}
          <Picker
            columns={[organizations]}
            value={[selectedOrgs.length > 0 ? selectedOrgs[selectedOrgs.length - 1] : organizations[0]]} // 只显示最后选中的组织
            onChange={(value: any) => toggleOrganization(value[0])} // 选择组织时切换
            onConfirm={handleConfirm} // 使用自定义确认处理
          />
          <style>
            {`
              .rv-picker__confirm,
              .rv-picker__cancel {
                display: none !important; /* 隐藏默认确认和取消按钮 */
              }
            `}
          </style>
        </div>
      </Popup>
    </div>
  );
});

export default OrganizationPickerComponent;