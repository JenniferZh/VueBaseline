<template>
  <div id="snl_box">
    <div id="description_container">
      <h2>
        {{this.current_node.text}}自然语言描述
      </h2>
      <el-row>
        <el-col :span="20">
          <div class="grid-content bg-purple">
            <el-input
              type="textarea"
              id="text_area"
              rows=3
              v-model="current_node.description"
              v-bind:disabled= "disable_flag"
            >
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple-light">
            <div id="btns">
              <el-button type="primary" v-on:click='editDescription()' >修改</el-button>
              <el-button type="success" v-on:click='saveDescription()' >保存</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div id="snl_container">
      <div id="tag-span">
        <span>标签：</span>
        <el-tag  v-for = "(tag, index) in current_node.tags"
          :key="tag" size="medium"  closable
          @close="handleClose(tag)">
          {{ tag }}
        </el-tag>
        <el-select v-model="label" filterable placeholder="新增规则库标签"
          @change="selectTag(label)"
        >
          <el-option
            v-for="item in tag_options"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>
      <!--用于展示规则的列表-->
      <el-button id="new-snl"type="primary" icon="el-icon-edit" @click="newSNL">新建SNL语句
      </el-button>

      <el-table
        :data="this.snl_html_lists"
        >
        <el-table-column  label="SNL语句" min-width="70%">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper" v-html="scope.row">
              <!--{{ scope.row.snl }}-->
            </div>
          </template>

        </el-table-column>
        <el-table-column  label="操作"  min-width="30%">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="snlEdit(scope.$index, scope.row) ">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="snlDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <edit-dialogue
        :show = "edit_show"
        ref = "edit_dialog"
        :parent = "parent_name"
        :config_keys="config_keys"
        @save = "save" @close="close" >
      </edit-dialogue>

      <el-dialog
        title="删除提示"
        :visible.sync="snl_delete_show"
        center>
        <span>您确定删除选中的SNL语句吗？</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="snlCancelDelete">取 消</el-button>
          <el-button type="primary" @click="snlSureDelete">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import editDialogue from "../components/editDialogue.vue"
import {HOST} from '../utils/config'

export default {

  //id是用来查询规则库的标识
  props:["tag_options", "id", "config_keys"],
  components:{
    editDialogue,
  },

  data() {
    return {
      //2 disable_flag决定了description是否可以编辑
      //text_area存储输入框里的值，current_node存储当前被点击节点的信息
      //list_data存储当前节点的所有信息
      //edit_show决定对话框是否显示
      //default_tags是传入对话框的参数数组
      disable_flag:true,
      text_area:"",
      current_node:{},
      edit_show:false,
      snl_delete_show:false,
      current_snl:{},
      current_snl_html:"",
      parent_name:"rule",
      label:"",//v-model的值为当前被选中的el-option的 value 属性值

      snl_html_lists:[],

      key_words : [
        // other:
        ["的", ".", "。"],
        //structure:
        [
          "如果","if",
          "那么","then",
          "不存在","存在一个","所有",
          "不","只"
        ],
        // operation:
        [
          "contains","notcontains",
          "equals","notequals"
        ],
        // num_compare:
        [
          "=",">=",">","<=","<"
        ],
        // regex:
        ["regex"],
        // property_name:
        ["~", ",", "@", "-"],
        // logic_connect:
        ["且","并且","或","或者"],
        // relation_compare:
        ["多于","少于","至多","至少"],
        // four_operations:
        ["+","-","*","/"],
        // quote:
        ["'", '"', '“','”'],
        //subject

      ],

      class_names:["other", "structure", "operation", "num_compare", "regex", "property_name", "logic_connect", "relation_compare", "four_operations", "quote", "subject","common"],

      newline_words:["如果","if","那么","then"],//需要换行的words


    }
  },

  created(){
    // console.log("进入ruleClick的create函数");
  },
  methods:{
    showList(current_node){
      //先把关键词subject引进来
      this.key_words.push(this.config_keys);
      this.current_node = current_node;
      //清空数组
      this.snl_html_lists = [];
      for(var snl_spl of this.current_node.snl_spl_pairs){
        var snl_html = this.snlToHtml(snl_spl.snl);
        this.snl_html_lists.push(snl_html);
      }
    },

    editDescription(){
      this.disable_flag = false;
    },

    saveDescription(){
      this.disable_flag = true;
      this.$emit("metadataSend");

    },

    snlEdit(index, row_data){
      console.log("进入snlEdit函数");
      this.current_snl = this.current_node.snl_spl_pairs[index];
      this.$refs.edit_dialog.updateDefaultData(this.current_snl, index, this.config_keys);
      this.edit_show = true;
    },

    snlDelete(index, row_data){
      console.log("进入SNL删除函数");
      this.current_snl = this.current_node.snl_spl_pairs[index];
      this.snl_delete_show = true;
      console.log(this.current_snl);
      console.log(this.current_node);
      // this.current_node.snl_spl_pairs.splice(index, 1);
    },

    snlSureDelete(){
      let index = this.current_node.snl_spl_pairs.indexOf(this.current_snl);
      this.current_node.snl_spl_pairs.splice(index, 1);
      //删除了单条SNL，那么必须把这个还原，这样的话就可以更新了
      this.current_snl = {};
      this.snl_delete_show = false;
      this.$emit("metadataSend");
    },

    snlCancelDelete(){
      this.snl_delete_show = false;
    },

    newSNL() {
      var new_item = {
        snl:"new",
        spl:[],
      };
      this.current_node.snl_spl_pairs.push(new_item);
      this.current_snl = new_item;//激发变化
      this.$emit("metadataSend");
    },

    save(new_data){
      this.edit_show = false;
      console.log("进入ruleClick的save函数");
      console.log(new_data);
      console.log(this.current_node);
      this.current_node.snl_spl_pairs[new_data.index].snl = new_data.snl;
      this.current_snl = this.current_node.snl_spl_pairs[new_data.index].snl;
      this.$emit("metadataSend");
    },

    close(){
      this.edit_show = false;
    },

    handleClose(tag){
      console.log("要删除的标签是：");
      console.log(tag);
      this.current_node.tags.splice(this.current_node.tags.indexOf(tag), 1);
      this.$emit("metadataSend");
    },

    selectTag(value){
      // console.log("被选中的标签是：");
      // console.log(value);
      // console.log("label 是" + this.label);
      //判断选中的标签是否已经存在标签中
      if(this.current_node.tags.indexOf(value) >= 0){
        console.log(value);
        console.log("标签已经存在于该规则中");
        alert("标签已经存在于该规则中");
      }
      else{
        this.current_node.tags.push(value);
        this.$emit("metadataSend");
      }
    },

    snlToHtml(input_str){
      let line_index = 1;
      while(input_str.indexOf("\n") != -1){
        input_str = input_str.replace("\n", ' ');
      }
      while(input_str.indexOf("\r") != -1){
        input_str = input_str.replace("\r", ' ');
      }
      var words = input_str.split(' ');
      var snl_html = "";
      for(var word of words){
        if(word.length == 0 || word==" "){
          continue;//空格的话进入下一单词的检测
        }
        var type = this.typeKeyWord(word);
        var str = "";
        var _class = "";
        if(this.newline_words.indexOf(word) != -1){
          if(line_index !== 1){
            str += "<br/>";
          }
          line_index += 1;
        }

        _class = this.class_names[type];

        if(this.attrbute_flag){
          _class="attribute";
          this.attrbute_flag = false;
        }

        if(word == "的" || word=="有属性"){
          this.attrbute_flag = true;
          _class = "structure";
        }
        str += '<span class="' + _class + '">' + word + '</span>';
        snl_html += str;
        snl_html += "&nbsp";
      }
      return snl_html;
    },

    typeKeyWord(word){
      for(var type in this.key_words){
        for(var key of this.key_words[type]){
          if(word === key){
            return type;
          }
        }
      }
      return this.key_words.length;
    },
  },

  watch:{
    current_snl(){
      //每当current_snl变化时，重新渲染，因为在编辑的时候它会变化
      this.snl_html_lists = [];
      for(var snl_spl of this.current_node.snl_spl_pairs){
        var snl_html = this.$refs.edit_dialog.snlToHtml(snl_spl.snl);
        this.snl_html_lists.push(snl_html);
      }
    },

  }
}
</script>
<style scoped>
span{
  /*white-space: normal !important;*/
}

#description_container{
  position: relative;
  /* left: 20%; */
  padding-left: 20%;
  padding-right: 20%;
  max-height: 30%;
  width: 100%;
  box-sizing: border-box;
  /* background-color: #F2F6FC; */
  padding:1% 1%;
  border-bottom: 2px solid #DCDFE6;
}

/* #text_area{
  max-width: 60% !important;
} */

.el-textarea{
  position: relative;
  width: 90%;
  left: 0%;
}

#snl_container{
  position: relative;
  margin-top: 2%;
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
  max-height: 70%;
  box-sizing: border-box;
}

#tag-span{
  position: relative;
  width: 100%;
  /*display: inline-flex;*/
  /*justify-content:space-around;*/
  border-bottom: 2px solid #DCDFE6;
  padding-bottom: 1%;
}

#new-snl{
  position: relative;
  left: 85%;
  top:20px;
}
/* p{
  text-align: center;
} */

.el-table{
    /* width:80%;
    padding-left: 10%; */
    position: relative;
    top:20px;
    /*table-layout: auto;*/
}

.el-table td {
  background-color: #EBEEF5;
  text-align: left;
}

.el-table th div {
    padding-right: 10px;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
}



#btns{
  position: relative;
  top:20px;
}

h2{
  text-align: center;
  padding: 0px ;
  margin-top: 0px;
  margin-bottom: 20px;
}
.el-tag{
  margin-right: 2%;
  display:inline;
}

.other{

}

.structure{
  color: red;
}

.operation{
  color:red;
}


.num_compare {
  color: blue;

}
.regex{

}
.property_name{

}

.logic_connect {
  color: blue;

}

.relation_compare{
  color:blue;
}

.four_operations{

}

.quote{

}

.subject{
  color:red;
}
.common{
  color:black;
}

.attribute{
  color:blue;
}



</style>
