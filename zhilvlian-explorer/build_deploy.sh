 #!/bin/sh
  ##总体逻辑是：生产环境发版，如果已经有deploy，则直接update image tag，如果没有利用deploy.yaml模板创建deploy,ing,svc等。
  NEW_CI_PROJECT_NAMESPACE=$(echo "$CI_PROJECT_NAMESPACE" | cut -d / -f 2)
  if [ $CI_COMMIT_BRANCH == "master" ];then 
  ##判断prod是否有ingress，如果没有就创建。
    kubectl -n $NS --kubeconfig=/etc/deploy/kube2prod get deploy|egrep -i $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME
    if [ $? -eq 0 ]; then
        ###将文件导入全局变量生产的kube2prod到/etc/deploy/kube2prod
      kubectl -n $NS --kubeconfig=/etc/deploy/kube2prod set image deployment/$NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME=reg.shukeyun.com:9088/$NEW_CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:$CI_PIPELINE_ID
      sleep 10s 
      kubectl -n $NS --kubeconfig=/etc/deploy/kube2prod  | grep $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME | awk '{print $3}' | egrep -i  'Running|Containercreating'
	  ##判断是否更新tag成功，如果成功，则echo succcess
	 
        if [ $? == 0 ];then
          echo "deploy is success"
        else
          echo "deploy failed"
        fi
  ##如果没有deployment,则用deploy模板创建。
    else
      sed -i s/{{PROJECT_NAME}}/$CI_PROJECT_NAME/g deploy.yaml
      sed -i s/{{NAMESPACE}}/$NS/g deploy.yaml
      sed -i s/{{PROJECT_NAMESPACE}}/$NEW_CI_PROJECT_NAMESPACE/ deploy.yaml
      sed -i s/{{IMAGE_TAG}}/$CI_PIPELINE_ID/ deploy.yaml
      cat deploy.yaml
      kubectl -n $NS --kubeconfig=/etc/deploy/kube2prod apply -f deploy.yaml
    fi
  
  ##canary环境发版
  elif  [ $CI_COMMIT_BRANCH == "canary" ];then 
    ##判断canary是否有deploy，如果没有就创建。
    kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/kube2canary get deploy|egrep -i $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME
    if [ $? -eq 0 ]; then
        ###将文件导入全局变量生产的kube2canary到/etc/deploy/kube2canary
      kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/kube2canary set image deployment/$NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME=reg.shukeyun.com:9088/$NEW_CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:$CI_PIPELINE_ID
      sleep 10s 
      kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/kube2canary  | grep $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME | awk '{print $3}' | egrep -i  'Running|Containercreating'
	  ##判断是否更新tag成功，如果成功，则echo succcess
	 
        if [ $? == 0 ];then
          echo "deploy is success"
        else
          echo "deploy failed"
        fi
  ##如果没有deployment,则用deploy模板创建。
    else
      sed -i s/{{PROJECT_NAME}}/$CI_PROJECT_NAME/g deploy.yaml
      sed -i s/{{NAMESPACE}}/$CI_COMMIT_BRANCH/g deploy.yaml
      sed -i s/{{PROJECT_NAMESPACE}}/$NEW_CI_PROJECT_NAMESPACE/ deploy.yaml
      sed -i s/{{IMAGE_TAG}}/$CI_PIPELINE_ID/ deploy.yaml
      cat deploy.yaml
      kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/kube2canary apply -f deploy.yaml
    fi
 
  
  
##非canary/prod发版   
  else 
    ##判断其他ns是否有deploy，如果没有就创建。
    kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/config get deploy|egrep -i $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME
	  if [ $? -eq 0 ]; then   
	##将文件导入全局变量测试环境的kubeconfig_test_dev
        kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/config set image deployment/$NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME=reg.shukeyun.com:9088/$NEW_CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:$CI_PIPELINE_ID
        sleep 10s 
        kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/config get pods   | grep $NEW_CI_PROJECT_NAMESPACE-$CI_PROJECT_NAME | awk '{print $3}' | egrep -i  'Running|Containercreating'
           if [ $? == 0 ];then
               echo "deploy is success"
            else
               echo "deploy failed"
           fi
      else
       sed -i s/{{PROJECT_NAME}}/$CI_PROJECT_NAME/g deploy.yaml
       sed -i s/{{NAMESPACE}}/$CI_COMMIT_BRANCH/g deploy.yaml
       sed -i s/{{PROJECT_NAMESPACE}}/$NEW_CI_PROJECT_NAMESPACE/ deploy.yaml
       sed -i s/{{IMAGE_TAG}}/$CI_PIPELINE_ID/ deploy.yaml
       cat deploy.yaml
       kubectl -n $CI_COMMIT_BRANCH --kubeconfig=/etc/deploy/config apply -f deploy.yaml
   fi
  fi
  
