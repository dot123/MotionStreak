/*
 * @Author: conjurer
 * @Github: https://github.com/dot123
 * @Date: 2020-05-20 10:33:50
 * @LastEditors: conjurer
 * @LastEditTime: 2020-05-20 18:14:35
 * @Description:
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class MotionStreak extends cc.Component {
    @property({
        tooltip: "开启拖动",
    })
    private drag: boolean = true;

    @property({
        tooltip: "拖尾数量（控制拖尾长度和消失时间）",
        type: cc.Integer,
    })
    private renderNum: number = 10;

    @property({
        tooltip: "拖尾帧间隔",
        type: cc.Integer,
    })
    private duration: number = 0;

    private sprite: cc.Sprite = null;

    private spriteList: cc.Sprite[] = [];

    private renderList: Object[] = [];

    private lastPos: cc.Vec3 = cc.v3();

    private count: number = 0;

    public onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        this.lastPos = this.node.position;
        if (this.drag) {
            this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
                let touchPos = event.getLocation();
                let uiPos = this.node.parent.convertToNodeSpaceAR(touchPos);
                this.node.setPosition(uiPos);
            });
        }
        for (let i = 0; i < this.renderNum; i++) {
            this.AddSprite();
        }
    }

    private AddSprite() {
        let spNode = new cc.Node();
        let sp = spNode.addComponent(cc.Sprite);
        this.sprite.node.parent.addChild(spNode);
        this.spriteList.push(sp);
    }

    public update(dt) {
        if (this.count < this.duration) {
            this.count++;
            return;
        }
        this.count = 0;

        let position = this.sprite.node.position;
        if (!this.lastPos.equals(position)) {
            //位置有变化
            this.renderList.unshift({
                spriteFrame: this.sprite.spriteFrame,
                position: position,
            });
            this.lastPos.set(position);
        } else {
            this.renderList.pop();
        }

        if (this.renderList.length > this.renderNum) {
            this.renderList.pop();
        }

        let i = 0;
        for (i = 0; i < this.renderList.length; i++) {
            let info = this.renderList[i];
            let sprite = this.spriteList[i];
            sprite.spriteFrame = info["spriteFrame"]; //设置精灵帧
            sprite.node.position = info["position"]; //设置位置
            sprite.node.active = true;
            sprite.node.opacity = 255 * (1 - i / this.renderNum); //设置透明度
            sprite.node.zIndex = this.renderNum - i; //设置层级
        }

        for (i; i < this.renderNum; i++) {
            let sprite = this.spriteList[i];
            sprite.node.active = false;
        }
    }
}
