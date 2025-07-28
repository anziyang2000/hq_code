# 测试用例

## 1 测试用例

``` text
	# BalanceOf
	business 0
	dealer   0
	gov01    0

	# MintWithTokenUri
	MintWithTokenUri --- business-user 388071016 #成功
	MintWithTokenUri --- dealer-user   388071017 #成功
	MintWithTokenUri --- dealer-user   388071018 #成功
	MintWithTokenUri --- dealer-user   388071019 #成功
	
	# BalanceOf
	business #1
	dealer   #3
	gov01    #0
	
	# Transform
	# gov01 尝试将 dealer 的资产转移到 business
	# gov01 转账 3017 到 business #失败
	# gov01 转账 3018 到 business #失败
	# gov01 转账 3019 到 business #失败
	
	# Approve,GetApproved
	查询 388071017 的 approved 状态     #空  
	dealer 将 388071017 授权给 gov01    #true
	查询 388071017 的 approved 状态     #gov01的clientID
	
	# Transform
	gov01 转账 388071017 给 business #成功（单独 approve 授权过）
	gov01 转账 388071018 给 business #失败（没有 approve ）
	gov01 转账 388071019 给 business #失败（没有 approve ）

	# BalanceOf
	business #2
	dealer   #2
	gov01    #0
	
	# IsApprovedForAll
	dealer 查询 gov01 是否被允许托管自己的资产 #false
	
	# SetApprovalAll
	dealer enable授权 gov01 管理资产 #true
	
	# IsApprovedForAll
	dealer 查询 gov01 是否被允许托管自己的资产 #true
	
	# GetApproved
	查询 388071017 的 approved 状态 #false
	查询 388071017 的 approved 状态 #false
	
	# Transform
	gov01 转账 388071018 给 business #成功（approveAll）
	gov01 转账 388071019 给 business #成功（approveAll）
	
	# BalanceOf
	business #4
	dealer   #0
	gov01    #0
	
	# MintWithTokenUri
	MintWithTokenUri --- dealer-user   388071020 #成功
	MintWithTokenUri --- dealer-user   388071021 #成功
	
	# BalanceOf
	dealer   #2
	
	# IsApprovalAll
	dealer 查询 gov01 是否是自己的资产管理者 #true
	
	# GetApproved
	查询 388071020 的 approved 状态 #false
	查询 388071021 的 approved 状态 #false
	
	# Transform
	gov01 转账 388071020 给 business #成功（approveAll）
	
	# SetApprovalAll
	dealer disable授权 gov01 管理资产 #true
	
	# IsApprovalAll
	dealer 查询 gov01 是否是自己的资产管理者 #false
	
	# Transform
	gov01 转账 388071021 给 business #失败（approveAll已经被取消）
	
	# BalanceOf
	business #5
	dealer   #1
	gov01    #0
	
	# Approve,GetApproved
	查询 388071021 的 approved 状态     #空
	dealer 将 388071021 授权给 gov01    #true
	查询 388071021 的 approved 状态     #gov01的clientID
	
	# Transform
	gov01 转账 388071021 给 business #成功（approved）
	
	# BalanceOf
	business #6
	dealer   #0
	gov01    #0
	
	# TotalSupply
	查询当前发现总量 #6
	
	# Burn
	business 销毁 388071021 #true
	
	# BalanceOf
	business #5
	dealer   #0
	gov01    #0
	
	# TotalSupply
	查询当前发现总量 #5
	
	# GetApproved
	查询 388071020 approved #空
	
	# Approve
	business 授权 dealer 操作 388071020 #true
	
	# GetApproved
	查询 388071020 approved             #dealer的ID
	
	# Burn
	dealer 销毁 388071020 #失败
	
	# BalanceOf
	business #5
	dealer   #0
	gov01    #0
	
	# Name,Symbol
	查询 Name   #空
	查询 Symbol #空
	
	# SetOption
	设置 "BDS", "Zmint"
	
	# Name,Symbol
	查询 Name   #空
	查询 Symbol #空
```
