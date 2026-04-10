
current_dir=$(pwd)

cd ../..

rm -rf dist

npm run build

cd $current_dir

#tail -f /var/log/nginx/error.log /var/log
ansible-playbook ./playbook/deploy.yml -i ~/.ansible/inventory/hosts -l ubuntu_server