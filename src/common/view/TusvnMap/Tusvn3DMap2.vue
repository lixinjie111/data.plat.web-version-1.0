<template>
    <div style="width: 100%; height: 100%; left: 0px; top: 0px; ">
        <div :id="targetId"  style="height:100%;width:100%;"></div>
    </div>
</template>
<script>


import _ from 'lodash';



export default {
    name:"Tusvn3DMap2",
    props:["targetId"],
    data(){
        return {
            mapoption:{
                doc: this.targetId,
                background:"black",
                navMode: Pt.earthControls   //earthControls  OrbitControls
            }
            ,viewer:null
            ,scene:null
            // ,viewVector1:{x:287406.0,y:3463772,z:50}
            // ,viewVector2:{x:287707.0,y:3463835.0,z:80.0}
            //科技园
            ,viewVector1:{x:442350.475567611,y:4427186.352713934,z:50}
            ,viewVector2:{x:442637.284474562,y:4427363.359317946,z:80.0}


            //上海
            // ,viewVector1:{x:325694.8329,y:3462004.5056,z:50}
            // ,viewVector2:{x:326765.6277,y:3462754.6978,z:80.0}

            ,shps:{}
            ,models:{}
            ,deviceModels:{
            }

            ,modelPersonArr:[]
            ,cacheModelNum:400

            // ,websocketUrl:"ws://10.0.1.57:9999/ws"
            // ,websocketUrl:"ws://192.168.1.132:9998/ws"
            // ,websocketUrl:"ws://120.133.21.14:29998/ws"
            // ,websocketUrl:"ws://10.0.1.57:9982/mon"
            ,websocketUrl:"ws://192.168.1.68:9982/mon"
            ,hostWebsocket:null
            ,tweens: {}

            ,mainCarVID:"B21E-00-023"
            ,carBusinessData:{}
            ,action:'track'//hostVehicle  track
            ,vehicleIds:'B21E-00-017,B21E-00-018,B21E-00-019,B21E-00-020,B21E-00-021,B21E-00-022,B21E-00-023,B21E-00-024'
            ,defualtRadius:100
            ,defualtPitch:-0.8
            ,defualtZ:12.816
            ,rcuId:"2046A1037E1F"

            ,matStdObjects : new THREE.MeshStandardMaterial( { color: 0x7337E3, roughness: 1, metalness: 0 } )
            ,person : new THREE.MeshStandardMaterial( { color: 0xC4B17A, roughness: 1, metalness: 0 } )
            ,fontface:"宋体"
            ,fontSize:60

            ,pitch:0
            ,yaw:0
            ,roll:Math.PI*(65/90)
            // ,lastUtmPosition: null
            // ,nowUtmPosition: null
            // ,utmposition: null

            ,sourceProject:"EPSG:4326"
            ,destinatePorject:"+proj=utm +zone=50 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
        }
    },
    watch:{
    },
    methods: {
        initMap:function(){
            this.viewer = dl.init(this.mapoption);
            this.scene = dl.scene;
            //添加数据
            // this.addShape("intersection","./static/map3d/suzhou_CityRoad_utm51/Intersection.shp",dl.styles.intersection.color)
            // this.addShape("Crosswalk","./static/map3d/suzhou_CityRoad_utm51/Crosswalk.shp",dl.styles.crosswalk.color)
            // this.addShape("lane_marking","./static/map3d/suzhou_CityRoad_utm51/Lane_marking.shp",dl.styles.lane_marking.color)
            // this.addShape("lane_arrow","./static/map3d/suzhou_CityRoad_utm51/Direction_arrow.shp",dl.styles.lane_arrow.color)
            // this.addShape("lane_boundary","./static/map3d/suzhou_CityRoad_utm51/Lane_boundary.shp",dl.styles.lane_boundary.color)

            // this.addShape("Crosswalk2","./static/map3d/kjy/UTM/crosswalk.shp","#999999")
            // this.addShape("lane2","./static/map3d/kjy/UTM/lane.shp",dl.styles.lane_boundary.color)
            // this.addShape("roadline2","./static/map3d/kjy/UTM/roadline.shp",dl.styles.lane_boundary.color)
          //科技园
          this.addShape("Crosswalk2","./static/map3d/newUTMData/crosswalk.shp","#999999")
          this.addShape("lane2","./static/map3d/newUTMData/lane.shp",dl.styles.lane_boundary.color)
          this.addShape("roadline2","./static/map3d/newUTMData/roadline.shp",dl.styles.lane_boundary.color)

            //上海
            // this.addShape("intersection","./static/map3d/dilu_zc/clip/Intersection.shp",dl.styles.intersection.color)
            // this.addShape("Crosswalk","./static/map3d/dilu_zc/clip/Crosswalk.shp",dl.styles.crosswalk.color)
            // // this.addShape("lane_marking","./static/map3d/20190531_utm51/clip/Lane_marking.shp",dl.styles.lane_marking.color)
            // this.addShape("lane_arrow","./static/map3d/dilu_zc/clip/Direction_arrow.shp",dl.styles.lane_arrow.color)
            // this.addShape("lane_boundary","./static/map3d/dilu_zc/clip/Lane_boundary.shp",dl.styles.lane_boundary.color)

          // this.addShape("1","./static/map3d/kjy/UTM/1.shp",dl.styles.lane_boundary.color)
          //   this.addShape("2","./static/map3d/kjy/UTM/2.shp",dl.styles.lane_boundary.color)
          //   this.addShape("3","./static/map3d/kjy/UTM/3.shp",dl.styles.lane_boundary.color)
          //   this.addShape("4","./static/map3d/kjy/UTM/4.shp",dl.styles.lane_boundary.color)
          //   this.addShape("5","./static/map3d/kjy/UTM/5.shp",dl.styles.lane_boundary.color)
          //   this.addShape("6","./static/map3d/kjy/UTM/6.shp",dl.styles.lane_boundary.color)
          //   this.addShape("7","./static/map3d/kjy/UTM/7.shp",dl.styles.lane_boundary.color)
          //   this.addShape("8","./static/map3d/kjy/UTM/8.shp",dl.styles.lane_boundary.color)
          //   this.addShape("9","./static/map3d/kjy/UTM/9.shp",dl.styles.lane_boundary.color)
          //   this.addShape("10","./static/map3d/kjy/UTM/10.shp",dl.styles.lane_boundary.color)
          //   this.addShape("11","./static/map3d/kjy/UTM/11.shp",dl.styles.lane_boundary.color)
          //   this.addShape("12","./static/map3d/kjy/UTM/12.shp",dl.styles.lane_boundary.color)


            // this.addShape("lane_marking","./static/map3d/suzhou_CityRoad_utm51/Lane_marking.shp",dl.styles.lane_marking.color)
            // this.addShape("lane_arrow","./static/map3d/suzhou_CityRoad_utm51/Direction_arrow.shp",dl.styles.lane_arrow.color)

            //初始化视锥体
            this.initView(this.viewVector1.x,this.viewVector1.y,this.viewVector1.z,this.viewVector2.x,this.viewVector2.y,this.viewVector2.z);

            // this.updateCameraPosition(442455.99844902,4427229.863377506,58.45029574064428,147.4909535804191,-0.6650238516042308,-0.8020833333333345);
            //添加模型
            // this.addModel("car","./static/map3d/map_photo/car.3DS",0,0,12.816);

            //矮路灯
            this.addModel("lamppost_01","./static/map3d/models/lamppost_01.3ds",442496.96,4427294.44,16);
            this.models["lamppost_01"].setHeading(30);
            this.models["lamppost_01"].setUpdate(true);

            //障碍物
            // this.addModel("traffic_cone","./static/map3d/models/traffic_cone.3ds",442492.797,4427280.995,16);
            // this.models["traffic_cone"].setHeading(30);
            // this.models["traffic_cone"].setUpdate(true);

            //大路灯
            this.addModel("street_lamp_two","./static/map3d/models/street_lamp_two.3ds",442501.99,4427272.65,16);
            this.models["street_lamp_two"].setHeading(30);
            this.models["street_lamp_two"].setUpdate(true);
            //红绿灯
            this.addModel("traffic_light","./static/map3d/models/traffic_light.3ds",442533.95,4427306.77,16);
            this.models["traffic_light"].setHeading(30);
            this.models["traffic_light"].setUpdate(true);

            //标识牌
            this.addModel("traffic_sign_stop","./static/map3d/models/traffic_sign_stop.3ds",442529.62,4427323.70,16);
            this.models["traffic_sign_stop"].setHeading(120);
            this.models["traffic_sign_stop"].setUpdate(true);

            //女人
            this.addModel("Girl walking N090814","./static/map3d/models/Girl walking N090814.3DS",442529.62,4427325.70,16);
            this.models["Girl walking N090814"].setHeading(120);
            this.models["Girl walking N090814"].setUpdate(true);
            //男人
            this.addModel("Man N151016.3DS","./static/map3d/models/Man N151016.3DS",442531.62,4427325.70,16);
            this.models["Man N151016.3DS"].setHeading(120);
            this.models["Man N151016.3DS"].setUpdate(true);

            //初始化websocket连接
            // this.initWebsocket(this.websocketUrl);
            // setInterval(()=>{
            //    let camera =  dl.viewer.scene.view;
            //    console.log(camera);
            // },1000);

            setTimeout(()=>{
                // 442454.32658246456,4427227.8078830885, 37.73509248844059, 0.0000028926452461693342,-0.5081018518518544,-0.7385192219746066
                // 442454.32658068417,4427227.807881102,37.735093606867046,0.0000028926452461693342,-0.39699074074074336,-0.730706721974606
                //科技园
                // this.updateCameraPosition(442454.32658068417,4427227.807881102,37.735093606867046,0.0000028926452461693342,-0.39699074074074336,-0.730706721974606);
                //科技园 小图
                // this.updateCameraPosition(442483.4140577592,4427251.954939776,31.211585511525108,31.559324326695666,-0.6520903697733481,-0.5889099326599347);
                this.$emit("mapcomplete",this);
                //上海
                // this.updateCameraPosition(326181.72659014474,3462354.6747002415,737.3642832288795,741.5052736914325,-1.5707963267948966,-0.05266622778143515);

            },500);



        },
        initView:function(x1,y1,z1,x2,y2,z2){
            let bbox = new THREE.Box3(new THREE.Vector3(x1,y1,z1), new THREE.Vector3(x2,y2,z2));
            dl.initView(bbox,this.viewer);
        },
        addShape:function(name,url,color){
            let shp = new dl.Shape({
                url: url,
                name: name,
                color: color
            });
            this.scene.add(shp);

            this.shps[name]=shp;
        },
        addModel:function(name,url,x,y,z){
            let model = new dl.Model({url: url});
            model.position.x = x;
            model.position.y = y;
            model.position.z = z;
            this.scene.add(model);

            this.models[name]=model;
        },
        updateModelPostion:function(modelId,x,y,z,heading){
            let model = this.models[modelId];
            if(model!=null)
            {
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                model.setHeading(heading);
            }
        },
        updateCameraPosition:function(x,y,z,radius,pitch,yaw){
            dl.moveTo({
                position: [x,y, z],
                radius: radius,
                yaw: yaw,
                pitch: pitch,
                viewer:this.viewer
            });
        },
        animate:function(time){
            requestAnimationFrame( animate );
            TWEEN.update( time );
        },
        update:function(e) {
            // console.log("=====================update====================================");
            // console.log(e)
            // model.position.x = lastUtmPosition.x;
            // model.position.y = lastUtmPosition.y;
            // model.setHeading(-Math.PI / 180 * (lastUtmPosition.rotation));
            // dl.moveTo({
            //         position: [lastUtmPosition.x+6,lastUtmPosition.y, 12.816],
            //         radius: 80,
            //         yaw: -Math.PI / 180 * (lastUtmPosition.rotation),
            //         pitch: -0.8
            // });
        },
        resetCamera:function(){
            this.updateCameraPosition(442456.0905737311,4427223.965503679, 60.22107514430958, 2.4329173138415072,-0.6747685185185206,-0.7853942219746017);
        },
        initWebsocket:function(url){
            if ('WebSocket' in window) {
                this.hostWebsocket = new WebSocket(url);
                this.hostWebsocket.onmessage = this.onMessage;
                this.hostWebsocket.onclose = this.onClose;
                this.hostWebsocket.onopen = this.onOpen;
                this.hostWebsocket.onerror = this.onError;
            }else{
                console.log("该浏览器不支持WebSocket!");
            }
        },
        timetrans:function (timestamp){
          var date = new Date(timestamp);//如果date为13位不需要乘1000
          var Y = date.getFullYear() + '-';
          var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
          var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
          var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
          var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
          var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
          var ms= date.getMilliseconds();
          return Y+M+D+h+m+s+"."+ms;
        },
        showBData:function(data)
        {
            this.models={};
            var time = this.timetrans(data.timestamp);
            this.$emit('showTimeStamp',time);
            var deviceid = data.deviceId;
            if(this.deviceModels[deviceid]==null)
            {
                this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                for(let m = 0;m<this.cacheModelNum;m++)
                {

                    //圆球
                    // var geoSphere = new THREE.SphereBufferGeometry( 0.8, 15, 15 );
                    // var model = new THREE.Mesh( geoSphere, matStdObjects );
                    // model.position.set( 0, 0, 0 );
                    // model.castShadow = true;
                    // model.receiveShadow = true;
                    // 0019D1AA0424  0019EAFA0104  0019EAFA0102  0018EAFA0332
                    //车
                    var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                    var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                    model1.position.set( 0, 0, 0 );
                    model1.rotation.set( this.pitch,this.yaw,this.roll );
                    model1.castShadow = true;
                    model1.receiveShadow = true;

                    this.scene.add(model1);
                    this.deviceModels[deviceid].cars[m] = model1;

                    var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                    var pmodel1 = new THREE.Mesh( pBox1, this.person );
                    pmodel1.position.set( 0, 0, 0 );
                    pmodel1.rotation.set( 0, 0, 0 );
                    pmodel1.castShadow = true;
                    pmodel1.receiveShadow = true;

                    this.deviceModels[deviceid].persons[m]= pmodel1;
                    this.scene.add(pmodel1);


                    var text1 = new dl.Text({
                        text:"",
                        fontsize:this.fontSize,
                        borderThickness:0,
                        textColor:{r: 0, g: 0, b: 0, a: 1.0}
                    });

                    this.deviceModels[deviceid].texts[m]=text1;
                    this.scene.add(text1);
                    text1.setPositon([0,0,0]);
                    text1.fontface=this.fontface;
                    text1.update();
                }
            }else{
                for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                {
                    let car = this.deviceModels[deviceid].cars[p];
                    car.position.x = 0;
                    car.position.y = 0;
                    car.position.z = 0;

                    let person = this.deviceModels[deviceid].persons[p];
                    person.position.x = 0;
                    person.position.y = 0;
                    person.position.z = 0;
                }
            }
        },
        showBData2:function(data){
             var deviceid = null;
            if(data!=null)
            {
                var time = this.timetrans(data.timestamp);
                this.$emit('showTimeStamp',time);
                deviceid = data.deviceId;
                if(this.deviceModels[deviceid]==null)
                {
                    this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                    for(let m = 0;m<this.cacheModelNum;m++)
                    {

                        //圆球
                        // var geoSphere = new THREE.SphereBufferGeometry( 0.8, 15, 15 );
                        // var model = new THREE.Mesh( geoSphere, matStdObjects );
                        // model.position.set( 0, 0, 0 );
                        // model.castShadow = true;
                        // model.receiveShadow = true;
                        // 0019D1AA0424  0019EAFA0104  0019EAFA0102  0018EAFA0332
                        //车
                        var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                        model1.position.set( 0, 0, 0 );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;

                        this.scene.add(model1);
                        this.deviceModels[deviceid].cars[m] = model1;

                        var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                        var pmodel1 = new THREE.Mesh( pBox1, this.person );
                        pmodel1.position.set( 0, 0, 0 );
                        pmodel1.rotation.set( 0, 0, 0 );
                        pmodel1.castShadow = true;
                        pmodel1.receiveShadow = true;

                        this.deviceModels[deviceid].persons[m]= pmodel1;
                        this.scene.add(pmodel1);


                        var text1 = new dl.Text({
                            text:"",
                            fontsize:this.fontSize,
                            borderThickness:0,
                            textColor:{r: 0, g: 0, b: 0, a: 1.0}
                        });

                        this.deviceModels[deviceid].texts[m]=text1;
                        this.scene.add(text1);
                        text1.setPositon([0,0,0]);
                        text1.fontface=this.fontface;
                        text1.update();
                    }
                }else{
                    for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                    {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;

                        let person = this.deviceModels[deviceid].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }
                }

            }
            for(let i = 0;i<data.data.targets.length;i++)
            {
                let d = data.data.targets[i];
                // // console.log(rsuDatas[i]);
                let dUTM = proj4(this.sourceProject,this.destinatePorject,[d.longitude,d.latitude]);

                if(d.type==0||d.type==1||d.type==3)
                {
                    if(i<this.deviceModels[deviceid].persons.length)
                    {
                        let mdl = this.deviceModels[deviceid].persons[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        let mdl = this.deviceModels[deviceid].cars[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                    }
                }
            }
        },
        onMessage:function(data){
            this.models={};

            let rsuDatas = JSON.parse(data.data);
            var deviceid = null;
            if(rsuDatas.result.length>0)
            {
                var time = this.timetrans(rsuDatas.result[0].timestamp);
                this.$emit('showTimeStamp',time);
                deviceid = rsuDatas.result[0].deviceId;
                if(this.deviceModels[deviceid]==null)
                {
                    this.deviceModels[deviceid]={cars:[],persons:[],texts:[]};
                    for(let m = 0;m<this.cacheModelNum;m++)
                    {

                        //圆球
                        // var geoSphere = new THREE.SphereBufferGeometry( 0.8, 15, 15 );
                        // var model = new THREE.Mesh( geoSphere, matStdObjects );
                        // model.position.set( 0, 0, 0 );
                        // model.castShadow = true;
                        // model.receiveShadow = true;
                        // 0019D1AA0424  0019EAFA0104  0019EAFA0102  0018EAFA0332
                        //车
                        var geoBox1 = new THREE.BoxBufferGeometry(1.7, 4.6, 1.4);
                        var model1 = new THREE.Mesh( geoBox1, this.matStdObjects );
                        model1.position.set( 0, 0, 0 );
                        model1.rotation.set( this.pitch,this.yaw,this.roll );
                        model1.castShadow = true;
                        model1.receiveShadow = true;

                        this.scene.add(model1);
                        this.deviceModels[deviceid].cars[m] = model1;

                        var pBox1 = new THREE.BoxBufferGeometry(0.4, 0.4, 1.7);
                        var pmodel1 = new THREE.Mesh( pBox1, this.person );
                        pmodel1.position.set( 0, 0, 0 );
                        pmodel1.rotation.set( 0, 0, 0 );
                        pmodel1.castShadow = true;
                        pmodel1.receiveShadow = true;

                        this.deviceModels[deviceid].persons[m]= pmodel1;
                        this.scene.add(pmodel1);


                        var text1 = new dl.Text({
                            text:"",
                            fontsize:this.fontSize,
                            borderThickness:0,
                            textColor:{r: 0, g: 0, b: 0, a: 1.0}
                        });

                        this.deviceModels[deviceid].texts[m]=text1;
                        this.scene.add(text1);
                        text1.setPositon([0,0,0]);
                        text1.fontface=this.fontface;
                        text1.update();
                    }
                }else{
                    for(let p=0;p<this.deviceModels[deviceid].cars.length;p++)
                    {
                        let car = this.deviceModels[deviceid].cars[p];
                        car.position.x = 0;
                        car.position.y = 0;
                        car.position.z = 0;

                        let person = this.deviceModels[deviceid].persons[p];
                        person.position.x = 0;
                        person.position.y = 0;
                        person.position.z = 0;
                    }
                }

            }
            for(let i = 0;i<rsuDatas.result.length;i++)
            {
                let d = rsuDatas.result[i];
                // // console.log(rsuDatas[i]);
                let dUTM = proj4(this.sourceProject,this.destinatePorject,[d.target.longitude,d.target.latitude]);

                if(d.target.type==0||d.target.type==1||d.target.type==3)
                {
                    if(i<this.deviceModels[deviceid].persons.length)
                    {
                        let mdl = this.deviceModels[deviceid].persons[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.target.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+5]);
                    }
                }else{
                    if(i<this.deviceModels[deviceid].cars.length)
                    {
                        let mdl = this.deviceModels[deviceid].cars[i];
                        mdl.position.x = dUTM[0];
                        mdl.position.y = dUTM[1];
                        mdl.position.z = this.defualtZ+4;

                        let text = this.deviceModels[deviceid].texts[i];
                        text.setText(d.target.uuid.substr(0,8));
                        text.setPositon([dUTM[0],dUTM[1],this.defualtZ+6]);
                    }
                }
            }
        },
        onClose:function(data){
            console.log("结束连接");
        },
        changeRcuId:function(url,rcuid)
        {
            this.websocketUrl = url;
            this.rcuId = rcuid;
             if ('WebSocket' in window) {
                if(window.WebSocket){
                    if(this.hostWebsocket!=null)
                    {
                        if(this.hostWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                            this.hostWebsocket.close();
                        }
                    }
                    this.hostWebsocket=null;
                    this.hostWebsocket = new WebSocket(this.websocketUrl);
                    this.hostWebsocket.onmessage = this.onMessage;
                    this.hostWebsocket.onclose = this.onClose;
                    this.hostWebsocket.onopen = this.onOpen;
                    this.hostWebsocket.onerror = this.onError;
                }
             }else{
                 console.log("该浏览器不支持websocket");
             }
        },
        onOpen:function(){
            console.log("建立连接");
            // 2046A1035893
            // var hostVehicle = '{"action":"rcu","data":{"rcuId":"2046A1037E1F"},"token":"fpx"}';
            // var hostVehicleMsg = JSON.stringify(hostVehicle);
            var hostVehicle = '{"action":"RCUPer","devId":"'+this.rcuId+'"}';
            this.sendMsg(hostVehicle);
        },
        sendMsg:function(msg){
            if(window.WebSocket){
                if(this.hostWebsocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    this.hostWebsocket.send(msg); //send()发送消息
                    console.log("已发送消息:"+ msg);
                }
            }
        },
        onError:function(e){
            console.log(e);
        },
        pageResize(){
            const borwserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            this.pageHeight = borwserHeight - 64;
            // console.log('pageHeight : ' + this.pageHeight)
        },
        resize:function(size)
        {

        }
    },
    created(){

    },
    mounted(){
        this.pageResize();
        window.onresize = () => {
            this.pageResize();
        }
        //初始化地图
        setTimeout(() => {
            this.initMap();
        }, 1000);
    },
    destroyed(){

    }
}
</script>
<style>
    #map {
        width: 100%;
        height: 100%;
        overflow: hidden;
        margin:0;
    }
    canvas {
        width: 100%;
        height: 100%;
        position: relative;
    }

</style>
