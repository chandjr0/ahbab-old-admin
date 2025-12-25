import React from 'react'
import { TreeSelect, Switch, Space } from 'antd';
const { TreeNode } = TreeSelect;

const TreeSelectComponent = ({items,setSelectedCategory}) => {
  const [treeLine, setTreeLine] = React.useState(true);
  const [showLeafIcon, setShowLeafIcon] = React.useState(false);

  const getCategoryInfo = (value) => {

      console.log('valueeeeeeeee',JSON.parse(value))
  }
  return (
    <Space style={{width: '100%',marginBottom: '20px'}} direction="vertical">
      <label>Categories</label>
      <TreeSelect 
        treeLine={
          treeLine && {
            showLeafIcon,
          }
        }
        bordered={true}
        style={{width: '100%'}}
        focus={() => console.log('clicked')}
        onChange={value => setSelectedCategory(JSON.parse(value))}
      >
        {items?.map((item) =>
        <TreeNode value={JSON.stringify(item)} title={item?.name}>
        {item?.subcategory?.map((child) =>
        <TreeNode value={JSON.stringify(child)} title={child?.name}>
            {child?.subsubcategory?.map((grandChild) =>
            <TreeNode value={JSON.stringify(grandChild)} title={grandChild?.name} />
            )}
        </TreeNode>
        )}
      </TreeNode>
        )}
      </TreeSelect>
    </Space>
  );
};

export default TreeSelectComponent