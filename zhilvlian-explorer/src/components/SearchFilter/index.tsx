import { ProFormDateTimeRangePicker, ProFormSelect, QueryFilter } from '@ant-design/pro-components';
import { useEffect, useState, useRef } from 'react'; // 引入 useRef
import { getOrganizationList } from '@/services';
import { useModel, useLocation } from '@umijs/max';
import { ClockCircleOutlined, DownOutlined } from '@ant-design/icons'; // 引入时钟图标
import styles from './index.less';
import DatePickerComponent from '../DateRangePicker';
import OrganizationPickerComponent from '../OrganizationPicker';
import { Moment } from 'moment'; // 引入 Moment 类型

interface SearchInputType {
  onChange?: (value: any) => void;
  onFinish: (value: any) => void;  // 确保 onFinish 接收表单数据
  onReset?: (value: any) => void;  // 确保 onReset 接收表单数据
  className?: string;
}

const SearchFilter: React.FC<SearchInputType> = (props) => {
  const { initialState } = useModel('@@initialState');
  const [selectList, setSelectList] = useState([]);
  const [hasDateTime, setHasDateTime] = useState(false); // 用于控制图标的显示
  const [tempDateRange, setTempDateRange] = useState<[Moment | null, Moment | null]>([null, null]); // 暂存的时间范围
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]); // 用于存储所选组织
  const location = useLocation(); // 获取当前路由信息
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 判断是否为移动设备
  const datePickerRef = useRef<any>(null); // 使用 ref 引用 DatePickerComponent
  const orgPickerRef = useRef<any>(null); // 使用 ref 引用 OrganizationPickerComponent

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (
      (location.pathname === '/tx_list') &&
      !location.search
    ) {
      init();
    }
  }, [initialState?.channelList]);

  const init = async () => {
    const res = await getOrganizationList({
      channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
    });
    setSelectList(res);
  };

  return (
    <div className={styles.queryFilterWrap}>
      <QueryFilter
        defaultCollapsed
        span={8}
        autoFocusFirstInput={false}
        onFinish={async (values) => {
          const finalValues = {
            ...values,
            datetimeRanger: tempDateRange, // 只在点击查询时传递
            organization: selectedOrgs, // 将所选组织添加到最终值中
          };
          // console.log("查询表单数据: ", finalValues);
          props.onFinish(finalValues);
        }}
        onReset={async (value) => {
          if (props.onReset) {
            props.onReset(value);
          }
        }}
        submitter={{
          render: (props) => (
            <>
              <button
                type="button"
                onClick={() => {
                  props.form?.resetFields?.();
                  setHasDateTime(false); // 重置图标显示状态
                  setTempDateRange([null, null]); // 清空暂存的时间范围
                  setSelectedOrgs([]); // 清空所选组织

                  // 重置 DatePickerComponent 的日期选择器
                  if (datePickerRef.current) {
                    datePickerRef.current.resetDate(); // 调用 DatePickerComponent 的 resetDate 方法
                  }
                  
                  // 重置 OrganizationPickerComponent 的选择
                  if (orgPickerRef.current) {
                    orgPickerRef.current.resetOrg(); // 调用 OrganizationPickerComponent 的 resetOrg 方法
                  }
                }}
                className={styles.qingkongButton}
              >
                清空
              </button>
              <button
                type="button"
                onClick={() => {
                  props.form?.submit?.();
                }}
                className={styles.chazhaoButton}
              >
                查询
              </button>
            </>
          ),
        }}
      >
        {isMobile ? (
          <DatePickerComponent
            ref={datePickerRef} // 将 ref 传递给 DatePickerComponent
            onChange={(dates) => {
              if (dates[0] && dates[1]) {
                setTempDateRange(dates as [Moment | null, Moment | null]);
              }
            }}
          />
        ) : (
          <ProFormDateTimeRangePicker
            name="datetimeRanger"
            label="时间范围"
            placeholder={['开始时间', '结束时间']} // 设置自定义占位符
            fieldProps={{
              suffixIcon: hasDateTime ? null : <ClockCircleOutlined />, // 控制图标显示
              onChange: (dates) => {
                setTempDateRange(dates as [Moment | null, Moment | null]);
                setHasDateTime(!!(dates && dates[0] && dates[1]));
              },
            }}
            className={styles.hideIconOnHover} // 应用隐藏图标的 CSS 类
            style={{ color: '#fff' }}
          />
        )}
        
        {/* 这里根据是否为移动设备决定使用哪个组件 */}
        {location.pathname === '/tx_list' && (
          isMobile ? (
            <OrganizationPickerComponent
              ref={orgPickerRef} // 将 ref 传递给 OrganizationPickerComponent
              onChange={(selectedOrgs) => {
                setSelectedOrgs(selectedOrgs as string[]); // 强制转换为 string[]
              }}
            />
          ) : (
            <ProFormSelect
              fieldProps={{
                mode: 'multiple',
                maxTagCount: 'responsive',
                suffixIcon: <DownOutlined />,
                onChange: (value) => setSelectedOrgs(value as string[]), // 强制转换为 string[]
              }}
              style={{ width: '100%' }}
              name="organization"
              label="筛选成员"
              placeholder={['请选择（可选）']} // 设置自定义占位符
              showSearch
              options={selectList}
            />
          )
        )}
      </QueryFilter>
    </div>
  );
};

export default SearchFilter;
