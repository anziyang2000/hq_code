import React, { useEffect, useRef } from "react";
import { Modal } from "tea-component";
import { Account } from "../../utils/interface";
import AccountList from "./account-list";

export function AccountSelect(props:{
    visible:boolean;
    onClose:()=>void;
    onSelect:(ac:Account)=>void;
}){
    return <Modal
        onClose={props.onClose}
        visible={props.visible}
        caption="切换账户"
    >   
        <Modal.Body>
            <div className="select_scroll">
                <AccountList accountClick={props.onSelect}/>
            </div>
        </Modal.Body>
    </Modal>
}