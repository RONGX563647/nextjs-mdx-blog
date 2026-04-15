

# 快速回顾

## 模块1

```markdown
1.字节:计算机存储数据的最小存储单元(byte或者B)
  8bit = 1B -> 往后都是1024
2.常用的dos命令
  a.切换盘符   盘符名:
  b.查看       dir
  c.进入指定文件夹   cd 文件夹名     cd 文件夹名\文件夹名
  d.退到上一级   cd..
  e.退到根目录   cd\
  f.清屏      cls
  g.退出黑窗口   exit
  h.创建文件夹   mkdir 文件夹名      mkdir 文件夹名\文件夹名
  i.删除文件夹   rd 文件夹名     被删除的文件夹必须是空的,删除之后不走回收站
  j.删除文件     del 文件名.后缀名       del *.后缀名
      
3.jdk和jre以及jvm关系
  jdk包含jre,jre包含jvm
      
4.jvm和跨平台
  想要实现跨平台,就需要在不同的操作系统上安装不同版本的jvm
      
5.环境变量 -> JAVA_HOME
      
6.程序入门
  a.编写:
    public class 类名{
        public static void main(String[] args){
            System.out.println("helloworld");
        }
    }
  b.编译:
    javac java文件名.java
  c.运行:
    java class文件名
        
7.注释:对代码的解释说明
  单行注释: //
  多行注释: /**/
  文档注释: /***/

8.关键字:java提前定义好的,具有特殊含义的小写单词,在高级记事本中颜色特殊
    
9.常见问题
  a.编码问题:写代码以及运行遵守的编码要一致
  b.java文件名和类名一致问题
    带public的类类名要和java文件名一致
    一个java文件中最好写一个类
     
      
10.println和print区别
   相同点:都是输出语句
   不同点:println自带换行效果,print不带换行效果
       
第二大模块重点:常量 变量 类型转换 进制的转换
  1.常量的使用
  2.变量的使用
  3.会强制类型转换
```

## 模块2

```
模块二的回顾:
  1.常量:在代码的运行过程中,值不会发生改变的数据
    a.整数常量:所有的整数
    b.小数常量:所有带小数点的  2.0
    c.字符常量:带单引号的,单引号中必须有,且只能有一个内容
    d.字符串常量:带双引号的
    e.布尔常量:true false -> 可以当条件判断使用
    f.空常量:null 代表数据不存在,所以不能直接使用
  2.变量:在代码的运行过程中,会根据不同的情况而随时可以改变的数据
    a.定义:
      数据类型 变量名 = 值 -> 将等号右边的值赋值给等号左边的变量
    b.数据类型:
      基本类型:byte short int long float double boolean char
      引用类型:类 数组 接口 枚举 注解
          
  3.数据类型转换:等号左右两边类型不一致时,或者不同的类型做运算
    a.自动类型转换:小转大
      将取值范围小的类型赋值给取值范围大的类型
      取值范围小的类型和取值范围大的类型之间做运算
    b.强转:大转小
      取值范围小的数据类型 变量名 = (取值范围小的数据类型)取值范围大的数据类型
        
        
模块三的重点:
  all
```



## 模块3

```
模块三重点回顾:
  1.idea -> 自己看
  2.算数运算符: + - * / %(取余数)
    +:字符串拼接 -> 内容直接往后拼接
        
    自增自减:++ --
        a.单独使用:符号在前在后都是先运算
        b.混合使用:符号在前先运算,再使用运算后的值
                  符号在后先使用原值,再运算
            
  3.赋值运算符:
    = += -= *= /= %=
  4.比较运算符:结果都是boolean型的
    == > < >= <= !=    
      
  5.逻辑运算符:连接boolean结果的,结果还是boolean
    &&(短路效果) ||(短路效果) !(取反)  ^
      
  6.三元运算符:
    a.格式:
      boolean表达式?表达式1:表达式2
    b.执行流程:先走boolean表达式,如果是true,就走?后面的表达式1,否则就走:后面的表达式2
        
模块四重点:
  1.会使用Scanner和Random
  2.会使用switch以及知道case的穿透性
  3.会使用if
  4.会使用for循环,while循环,嵌套循环
  
```



## 模块4

```
课前回顾:
   1.Scanner:
    a.导包: import java.util.Scanner
    b.创建对象:Scanner 名字 = new Scanner(System.in)
    c.调用方法:
      nextInt()录入一个整数
      next()录入一个字符串,遇到空格和回车就结束
      nextLine()录入一个字符串,遇到回车就结束
  2.switch:选择语句
    a.格式:
      switch(变量){
          case 常量值1:
              执行语句1;
              break;
          case 常量值2:
              执行语句2;
              break;
          ...
              default:
              执行语句n;
              break;
      }
    b.执行流程:用变量代表的值去精准匹配,配上哪个case就走哪个case对应的执行语句,如果都配不上,就走default
               
    c.没有break:会出现case的穿透性,一直穿透,直到遇到break或者switch结束为止

  3.if...else:
    a.格式:
      if(boolean表达式){
          执行语句1
      }else{
          执行语句2
      }
    b.执行流程:
      先走if后面的boolean表达式,如果是true,就走if后面的执行语句1,否则就走else后面的执行语句2
  4.else...if
    a.格式:
      if(boolean表达式){
          执行语句1
      }else if(boolean表达式){
          执行语句2
      }else if(boolean表达式){
          执行语句3
      }...else{
          执行语句n
      }
    b.执行流程:
      从上到下挨个判断,哪个条件为true,就走哪个if对应的执行语句,以上所有的if都没有匹配上,走else
          
 5.for循环:
   a.格式:
     for(初始化变量;比较;步进表达式){
         循环语句
     }
   b.执行流程:
     先初始化变量,比较,如果是true,走循环语句
     走步进表达式,再比较,如果还是true,继续循环,直到比较为false,循环结束
         
6.while循环:
   a.格式:
     初始化变量;
     while(比较){
         循环语句
         步进表达式
     }
   b.执行流程
     先初始化变量,比较,如果是true,走循环语句
     走步进表达式,再比较,如果还是true,继续循环,直到比较为false,循环结束
       
 7.do...while循环:
   a.格式:
     初始化变量;
     do{
         循环语句
         步进表达式
     }while(比较);
   b.执行流程:
     初始化变量;
     循环语句
     步进表达式
     比较,如果是true,继续循环,直到比较为false
 8.死循环:比较永远是true
 9.嵌套循环:

   先走外层循环,再走内层循环,内层循环就一直循环,直到内层循环结束了,外层循环再进入下一次循环,直到连外层循环都结束了,循环整体结束
       
 10.循环控制关键字:
   break:结束循环
   continue:结束本次循环进入下一次循环
       
 9.Random
   a.概述:java定义好的类
   b.作用:在指定的范围内随机一个数
   c.使用:
     导包-> import java.util.Random
     创建对象-> Random 对象名 = new Random()
     调用方法: 
        对象名.nextInt() 在int的取值范围内随机一个数
        对象名.nextInt(int bound) -> 在0-(bound-1)之间随机

模块五重点:
  1.数组的定义和特点
  2.数组的操作(存数据,取数据,遍历数据)
  3.二维数组(定义,取,存,遍历)
```



## 模块5

```
 模块五的重点回顾:
   1.概述:容器,本身属于引用数据类型
   2.特点:
     a.定长
     b.既可以存储基本数据类型的数据,还可以存储引用数据类型的数据
   3.定义:
     动态初始化: 数据类型[] 数组名 = new 数据类型[长度]
     静态初始化: 数据类型[] 数组名 = {元素1,元素2...}
   4.数组操作:
     a.获取数组长度: 数组名.length
     b.存储数据: 数组名[索引值] = 元素 -> 将元素存储到数组指定的索引位置上
     c.获取元素: 数组名[索引值]
     d.遍历: 数组名.fori
     e.索引:指的是元素在数组中存储的位置
       从0开始,最大索引是数组.length-1
       唯一,不能重复
   5.操作数组时容易出现的异常
     a.数组索引越界异常:ArrayIndexOutOfBoundsException
       原因:操作的索引超出了数组索引范围
     b.空指针异常:NullPointerException
       原因:对象为null,然后再去操作此对象
           
  6.内存:
    a.栈:方法的运行在栈
    b.堆:数组,对象都在堆,而且每new一次都会在堆中开辟一个空间,堆内存会为此空间分配一个地址值
    c.方法区:代码运行之前的预备区,存储class文件
    d.本地方法栈
    e.寄存器
        
  7.二维数组概述:数组中套了多个一维数组
    a.动态初始化定义:数据类型[][] 数组名 = new 数据类型[m][n]
      m:代表的是二维数组长度
      n:代表的是每一个一维数组长度
          
    b.静态初始化定义(简化形式):
      数据类型[][] 数组名 = {{元素1,元素2...},{元素1,元素2...},{元素1,元素2...}...}

 8.二维数组操作:
   a.获取长度:数组名.length
   b.存元素: 数组名[i][j] = 值
     i:代表的是一维数组在二维数组中的索引位置
     j:代表的是元素在一维数组中的索引位置
         
   c.获取元素:数组名[i][j]
   d.遍历:嵌套for 先将一维数组从二维数组中遍历出来,然后再遍历每一个一维数组
       
       
模块六重点:
  all
```



## 模块6

```
模块六回顾:
  1.概述:拥有功能性代码的代码块
    将来干开发一个功能就应该对应一个方法
  2.方法的通用定义格式:
    修饰符 返回值类型 方法名(参数){
        方法体
        return 结果
    }

    a.修饰符:public static
    b.返回值类型:方法最终返回的结果的数据类型
    c.方法名:给方法取的名字,见名知意,小驼峰式
    d.参数:进入到方法内部参与执行的数据
    e.方法体:具体实现该方法的具体代码
    f.return 结果:该方法操作完参数之后,最终返回的一个数据
        
  3.无参无返回值方法:
    a.定义:
      public static void 方法名(){
          方法体
      }
    b.调用:方法名()
        
  4.有参无返回值方法:
    a.定义:
      public static void 方法名(形参){
          方法体
      }

    b.调用:
      方法名(实参)
          
  5.无参有返回值方法:
    a.定义:
      public static 返回值类型 方法名(){
          方法体
          return 结果
      }

    b.调用:
      数据类型 变量名 = 方法名()
          
  6.有参有返回值方法:
    a.定义:
      public static 返回值类型 方法名(形参){
          方法体
          return 结果
      }

    b.调用:
      数据类型 变量名 = 方法名(实参)
          
  7.注意事项:
    a.方法不调用不执行,main方法是jvm调用的
    b.方法之间不能互相嵌套
    c.方法的执行顺序只和调用顺序有关
    d.void不能和return 结果共存,但是能和return共存
      void:代表没有返回值
      return 结果:代表有返回值,先将结果返回,再结束方法
      return:仅仅代表结束方法
          
    e.一个方法中不能连续写多个return
    f.调用方法是,需要看有没有此方法
          
          
  8.参数和返回值使用时机:
    a.参数:当想将一个方法中的数据,传递到另外一个方法中操作,就需要参数了
    b.返回值:如果调用者需要使用被调用者的结果,被调用者就需要将自己的结果返回
        
        
  9.方法的重载:
    a.概述:方法名相同,参数列表不同
    b.什么叫参数列表不同:
      参数个数不同,类型不同,类型顺序不同
    c.和什么无关:
      和参数名无关,和返回值无关
    
模块七重点:
  1.知道为啥使用面向对象思想编程
  2.知道怎么使用面向对象思想编程
  3.知道什么时候使用面向对象思想编程
  4.会利用代码去描述世间万物的分类
  5.会在一个类中访问另外一个类中的成员 -> new对象
  6.成员变量和局部变量的区别
```

## 模块7

```
模块七回顾:
  1.面向对象:是java的核心编程思想,自己的事情找对象帮我们去做
            有很多功能,别人帮我们实现好了,我们只需要找来这个对象,就可以调用这个对象中实现好的功能
    a.啥时候使用面向对象思想编程:在一个类中想访问另外一个类的成员(成员变量,成员方法)
    b.怎么使用:
      new对象 ,点成员
      特殊 :类名直接调用 -> 调用的成员中必须带static关键字
  2.类和对象:
    a.类:实体类
        属性(成员变量)  行为(成员方法,不带static的方法)
    b.对象:
      导包:两个类在同一个包下,使用对方的成员不需要导包,相反需要导包
          lang包下的类使用时不需要导包
      创建对象:想要使用哪个类中的成员,就new哪个类的对象
              类名 对象名 = new 类名()
      调用:想要使用哪个类的成员,就用哪个类的对象调用哪个成员
           对象名.成员
          
  3.匿名对象:没有等号左边的代码只有new
    a.注意:涉及到赋值,不要使用
  
  4.成员变量和局部变量的区别
    a.定义位置不同:
      成员:类中方法外
      局部:方法中或者参数位置
    b.初始化值不同
      成员:有默认值
      局部:没有默认值
    c.作用范围不同
      成员:作用于整个类
      局部:只作用于方法内部
    d.内存位置不同
      成员:在堆中,跟着对象走
      局部:在栈中,跟着方法走
    e.生命周期不同
      成员:随着对象的创建而创建,随着对象的消失而消失
      局部:随着方法的调用而产生,随着方法的调用完毕而消失
          
模块八重点:
  1.要会使用private关键字修饰成员,并知道被private修饰之后作用(访问特点)是什么
  2.会使用set方法为属性赋值,使用get方法获取属性值
  3.会利用this关键字区分重名的成员变量和局部变量
  4.会利用空参构造创建对象,并知道空参构造作用
  5.会使用有参构造创建对象,并为属性赋值
  6.会快速生成一个标准的javabean类
```

## 模块8

```
模块八重点:
  1.封装:
    a.将细节隐藏起来,不让外界直接调用,再提供公共接口,供外界通过公共接口间接使用隐藏起来的细节
    b.代表性的:
      将一段代码放到一个方法中(隐藏细节),通过方法名(提供的公共接口)去调用
      private关键字 -> 私有的,被private修饰之后别的类不能直接调用,只能在当前类中使用
          
    c.get/set方法
      set方法:为属性赋值
      get方法:获取属性值
          
    d.this关键字:代表当前对象,哪个对象调用this所在的方法this就代表哪个对象
      区分重名的成员变量和局部变量
        
  2.构造:
    a.无参构造:new对象
      特点:jvm会自动为每个类提供一个无参构造
    b.有参构造:new对象  为属性赋值
      特点:如果手写了有参构造,jvm将不再提供无参构造,所以建议都写上
          
  3.标准javabean:
    a.类必须是公共的,具体的
    b.必须有私有属性
    c.必须有构造方法(无参,有参)
    d.必须有get/set方法
        
    快捷键:alt+insert
        
模块九重点:
  1.会定义静态成员以及会调用静态成员
  2.会使用可变参数(会给可变参数传参)
  3.会二分查找(手撕)
  4.会冒泡排序(手撕)
  5.会debug的使用    
  
```

## 模块9

```
1.static 关键字

```

## 模块10

```
模块十回顾:
  1.继承:子类继承父类,可以直接使用父类中非私有成员,子类不用写重复性代码
  2.关键字: extends 
  3.成员访问特点:
    a.成员变量:看等号左边是谁
    b.成员方法:看new的是谁
  4.方法的重写:子类中有一个和父类从方法名以及参数列表上一样的方法
    a.检测:@Override
    b.使用场景:功能的升级
  5.继承中构造的特点:
    new子类对象先初始化父类
  6.super:代表的是父类引用
    a.调用父类构造:super()   super(实参)
    b.调用父类成员变量: super.成员变量名
    c.调用父类成员方法:super.成员方法名(实参)
  7.this:代表的是当前对象(哪个对象调用的this所在的方法,this就代表哪个对象)
    a.作用:区分重名的成员变量和局部变量
    b.使用:
      调用当前对象构造:this()  this(实参)
      调用当前对象成员变量:this.成员变量名
      调用当前对象成员方法:this.成员方法名(实参)
    c.注意:在构造中使用this和super,都必须要在第一行,所以两者不能同时出现
  8.继承的特点:
    a.继承只支持单继承,不支持多继承
    b.继承支持多层继承
    c.一个父类可以拥有多个子类
        
  9.抽象:
    a.抽象方法: 修饰符 abstract 返回值类型 方法名(形参)
    b.抽象类:public abstract class 类名{}
    c.特点:
      抽象方法所在的类一定是抽象类
      抽象类中不一定非得有抽象方法
      子类继承抽象父类时,需要重写抽象方法
      抽象类不能new对象,只能new子类对象
      抽象类中啥都可以有,私有属性,构造,其他方法等
      抽象类中的构造是供创建子类对象时初始化父类属性使用的
          
模块11重点:
  1.会定义接口
  2.会在接口中定义抽象方法,默认方法,静态方法,成员变量
  3.会调用接口中的成员
  4.知道多态的前提    
  5.会利用多态的方式new对象
  6.要知道使用多态的好处
  7.会在多态的前提下,向下转型
  8.会利用instanceof判断类型    
```

## 模块11

```
模块11回顾:
  1.接口:
    a.interface 接口
    b.implements 实现
  2.成员:
    a.抽象方法 -> 需要在实现类中重写
    b.默认方法 -> public default 返回值类型 方法名(参数){} -> 实现类中可重写可不重写
    c.静态方法 -> public static 返回值类型 方法名(参数){} -> 接口名直接调用
    d.成员变量 -> public static final 数据类型 变量名 = 值 -> 接口名直接调用
  3.接口的特点:
    a.接口支持多继承
    b.接口支持多实现
    c.一个子类可以继承一个父类的同时实现一个或者多个接口
  4.多态:
    a.前提:
      必须有子父类继承关系以及接口实现关系
      必须有方法的重写
      父类引用指向子类对象
    b.好处:扩展性强 -> 用父类类型接口,可以传递任意它的子类对象,接收哪个子类对象就指向哪个子类对象,就调用哪个子类对象重写后的方法
      弊端:不能直接调用子类特有方法
    c.转型:
      向上转型:父类引用指向子类对象
      向下转型:将父类类型转成子类类型,就可以调用子类特有功能
    d.成员的访问特点:
      成员变量:看等号左边是谁
      成员方法:看new的是谁
    e.转型时容易出现的问题:类型转换异常ClassCastException
    f.判断类型: instanceof
        
模块12重点:
  1.知道final修饰成员之后特点
  2.会使用静态代码块以及知道静态代码块的使用场景
  3.会使用匿名内部类
```





## 模块12

```
模块十二回顾:
  1.权限修饰符:
    public -> protected -> 默认 -> private
    
    a.构造一般用public :便于new对象
    b.成员方法一般用public:便于调用
    c.属性一般用private:封装思想
        
  2.final:最终的
    a.修饰类:不能被继承的
    b.修饰方法:不能被重写
    c.修饰局部变量:不能被二次赋值
    d.修饰对象:地址值不能改变,但是对象中的属性值可以改变
    e.修饰成员变量:需要手动赋值,不能二次赋值
        
  3.代码块:
    a.构造代码块:
      {}
      优先于构造方法执行,每new一次,构造代码块就执行一次
    b.静态代码块:
      static{
          
      }
      优先于构造代码块和构造方法执行的,只执行一次
          
   静态代码块>构造代码块>构造方法 -> 从执行顺序上来看
          
    
 4.匿名内部类:
   a.格式1:
     new 接口/抽象类(){
         重写方法
     }.重写的方法();

   b.格式2:
     接口/抽象类 对象名 = new 接口/抽象类(){
         
         重写的方法
     }
     对象名.重写的方法();

模块13重点:
  1.分清楚什么是编译时期异常,什么是运行时期异常
  2.知道处理异常的2种方式
  3.知道finally关键字的使用场景
  4.知道Object是啥
  5.知道Object中toString以及equals方法的作用
  6.知道重写完Object中的toString以及equals方法的作用
```

## 模块13

```
模块13回顾:
  1.异常:
    a.分类:Throwable
      Error:错误
      Exception:异常
          编译时期异常:一编译,就爆红(主要还是调用了某个方法,某个方法底层抛了一个编译时期异常)
                      Exception以及子类(除了RuntimeException之外)
          运行时期异常:一运行就报错
                     RuntimeException以及子类
 2.异常处理:
   throws
   try...catch
     
 3.finally:不管是否有异常都会执行的代码,要配合try...catch使用
     
   finally的使用场景:关闭资源使用
       
 4.自定义异常:
   a.定义一个类,继承Excption,变成了编译时期异常
              继承RuntimeException,变成了运行时期异常
   b.提供构造方法,便于设置异常信息
       
 5.Object:所有类的根类,任何类都会直接或者间接继承Object类
   a.toString方法:
     没有重写,直接输出对象名,调用的是Object中的toString方法,输出地址值
     重写了,直接输出对象名,默认调用重写的toString方法,输出对象内容
   b.equals方法:
     没有重写,比较对象地址值
     重写了,比较对象内容
         
   c.clone方法:需要实现Cloneable接口,重写clone方法
     复制一个地址值不一样,属性值一样的对象
         
 6.经典接口:
   Comparable
   Comparator
       
 
模块14重点:
  all
```



# 模块学习

# 模块一：基础概念以及 DOS 命令

### Java 文档注释

Java 文档注释以 `/**` 开头，以 `*/` 结尾，用于为类、方法、字段等元素添加说明文档。可使用特定标签描述元素信息，如 `@author` 指定作者，`@version` 指定版本号，`@param` 描述方法参数，`@return` 描述返回值，`@throws` 描述可能抛出的异常等。Javadoc 工具可根据文档注释自动生成 API 文档。

### **注意规范化编程**

```
// 文件头部注释示例
/**
 * @author 豆包
 * @version 1.0.0
 * @since 2025-03-15
 * @description 用户管理模块
 */
public class UserManager {
    // 常量命名示例
    private static final int MAX_USERS = 100;

    // 方法注释示例
    /**
     * 添加用户
     * @param user 用户对象
     * @return 是否成功
     */
    public boolean addUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("用户对象不能为空");
        }
        // 核心逻辑...
        return true;
    }
}
```

![image-20250315185934965](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315185934965.png)

![image-20250315190009439](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315190009439.png)





# 模块二：常量，变量，数据类型

### 常量与变量

- **常量**：程序运行过程中值不能改变的量。
- **变量**：程序运行过程中值可以改变的量，使用前需先声明并赋值。

### 数据类型

#### 八种基本类型

- **整数类型**：`byte`、`short`、`int`、`long`。
- **浮点类型**：`float`、`double`。
- **字符类型**：`char`。
- **布尔类型**：`boolean`。

#### 引用类型

- **类（Class）**：自定义类或使用 Java 标准库的类。
- **接口（Interface）**：定义一组方法签名，实现类需提供具体实现。
- **数组（Array）**：相同类型元素的集合。
- **枚举（Enum）**：限制变量为预定义的值。
- **注解（Annotation）**：为元素提供额外元数据信息，可在编译或运行时读取处理。

#### 特殊：注解

- **定义**：通过 `@interface` 关键字定义，可使用元注解（如 `@Retention`、`@Target` 等）指定保留策略和应用目标。

- **内置注解**：

  `@Override` 标记重写方法，

  `@Deprecated` 标记过时元素，

  `@SuppressWarnings` 抑制编译器警告。









# 模块三：Idea 使用



### 三层目录结构与取名规范

- **三层目录结构**：一般包含表现层、业务逻辑层和数据访问层，各层职责明确，提高代码的可维护性和可扩展性。
- **取名规范**：遵循 Java 命名规范，类名使用大驼峰命名法，方法名和变量名使用小驼峰命名法，常量名全部大写并用下划线分隔。
- ![image-20250315185739188](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315185739188.png)

### 开发时的快捷输入方法

- **`sout`**：快速生成 `System.out.println()` 语句。
- **`soutv`**：输出变量的值。
- **`soutm`**：输出当前方法名。
- **`soutp`**：输出方法的参数。
- **`fori`**：快速生成标准 `for` 循环语句。
- **`iter`**：生成增强 `for` 循环。
- **`try`**：快速生成 `try - catch` 语句块。
- **`psvm`**：快速生成 `main` 方法。

### 快捷键的使用

[IDEA快捷键](https://blog.csdn.net/qq_59961910/article/details/139085535)

按键映射可以自己设置

#### 代码编辑类

- `Ctrl + Space` 或 `alt + /`：代码自动完成。
- `Alt + Enter`：快速修复和提示，例如导包、生成变量等。
- `Ctrl + Alt + L`：格式化代码。
- `Ctrl + D`：复制当前行或选定的代码块。
- `Ctrl + Y`：删除当前行或删除选中的行。

#### 代码导航类

- `Ctrl + B`：跳转到定义处。
- `Alt + F7`：查找使用处。
- `Ctrl + F12`：显示文件结构。
- `Ctrl + H`：显示类层次结构。
- `Ctrl + Alt + ←/→`：返回 / 前进到上次编辑的位置。

#### 查找与替换类

- `Ctrl + F`：在当前文件中查找文本。
- `Ctrl + R`：在当前文件中替换文本。
- `Ctrl + Shift + F`：在项目中全局查找文本。
- `Ctrl + Shift + R`：在项目中全局替换文本。

#### 编译与运行类

- `Ctrl + F9`：编译项目。
- `Shift + F10`：运行当前项目或文件。
- `Shift + F9`：调试当前项目或文件。

#### 调试类

- `F8`：单步执行（进入方法内部）。
- `F7`：单步执行（跳过方法内部）。
- `Shift + F8`：跳出方法。
- `Alt + F9`：运行到光标处。
- `Alt + F8`：计算表达式的值。

#### 代码重构类

- `Shift + F6`：重构 - 重命名。
- `Ctrl + Alt + M`：提取方法。
- `Ctrl + Alt + V`：提取变量。
- `Ctrl + Alt + F`：提取字段。
- `Ctrl + Alt + C`：提取常量。

#### 运算符

#### 运算符的优先级

运算符优先级决定了表达式中运算符的计算顺序，例如括号的优先级最高，其次是算术运算符、比较运算符、逻辑运算符等。在复杂表达式中，可使用括号明确计算顺序。

![image-20250315191827958](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315191827958.png)







## 模块四  类，包

多数公司开发都喜欢用Java的原因之一就是因为Java 的丰富的类，可以帮助你快速开发，使用时会用即可。

在 Java 开发中，有许多常用的类，它们分布在不同的包中，为开发提供了各种功能支持。以下是一些 Java 开发中常用的类及其功能和

### 使用示例。

### 1. `java.lang` 包中的类

#### `String` 类

- **功能**：用于处理字符串，提供了许多操作字符串的方法，如拼接、截取、查找等。
- **示例**：

```java
public class StringExample {
    public static void main(String[] args) {
        String str1 = "Hello";
        String str2 = " World";
        String result = str1.concat(str2); // 拼接字符串
        System.out.println(result);
        int index = result.indexOf("World"); // 查找子字符串的位置
        System.out.println(index);
    }
}
```

#### `Integer` 类

- **功能**：是 `int` 基本数据类型的包装类，提供了一些与整数相关的方法，如将字符串转换为整数、获取最大值和最小值等。
- **示例**：

```java
public class IntegerExample {
    public static void main(String[] args) {
        String numStr = "123";
        int num = Integer.parseInt(numStr); // 将字符串转换为整数
        System.out.println(num);
        int max = Integer.MAX_VALUE; // 获取整数的最大值
        System.out.println(max);
    }
}
```

#### `System` 类

- **功能**：提供了一些与系统相关的方法和属性，如标准输入输出、获取当前时间戳等。
- **示例**：

```java
public class SystemExample {
    public static void main(String[] args) {
        long currentTime = System.currentTimeMillis(); // 获取当前时间戳
        System.out.println(currentTime);
        System.out.println("Hello, System!"); // 标准输出
    }
}
```

### 2. `java.util` 包中的类

#### `ArrayList` 类

- **功能**：实现了动态数组，可自动扩容，提供了添加、删除、查找等操作方法。
- **示例**：

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListExample {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("Apple");
        list.add("Banana");
        System.out.println(list.get(0)); // 获取指定位置的元素
        list.remove(1); // 删除指定位置的元素
        System.out.println(list.size()); // 获取列表的大小
    }
}
```

#### `HashMap` 类

- **功能**：实现了键值对的存储，提供了快速的查找和插入操作。
- **示例**：

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        map.put("One", 1);
        map.put("Two", 2);
        int value = map.get("One"); // 根据键获取值
        System.out.println(value);
        boolean containsKey = map.containsKey("Two"); // 判断是否包含指定的键
        System.out.println(containsKey);
    }
}
```

#### `Date` 类

- **功能**：用于表示日期和时间，不过现在更多使用 `java.time` 包中的类。
- **示例**：

```java
import java.util.Date;

public class DateExample {
    public static void main(String[] args) {
        Date now = new Date(); // 获取当前日期和时间
        System.out.println(now);
    }
}
```

### 3. `java.io` 包中的类

#### `File` 类

- **功能**：用于表示文件和目录，提供了创建、删除、重命名等操作方法。
- **示例**：

```java
import java.io.File;

public class FileExample {
    public static void main(String[] args) {
        File file = new File("test.txt");
        if (file.exists()) {
            System.out.println("文件存在");
        } else {
            try {
                boolean created = file.createNewFile(); // 创建新文件
                if (created) {
                    System.out.println("文件创建成功");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### `BufferedReader` 类

- **功能**：用于从字符输入流中读取文本，提供了缓冲功能，提高读取效率。
- **示例**：

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class BufferedReaderExample {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("test.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 4. `java.time` 包中的类（Java 8 及以后）

#### `LocalDateTime` 类

- **功能**：用于表示日期和时间，不包含时区信息，提供了丰富的日期时间操作方法。
- **示例**：

```java
import java.time.LocalDateTime;

public class LocalDateTimeExample {
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now(); // 获取当前日期和时间
        System.out.println(now);
        LocalDateTime future = now.plusDays(1); // 增加一天
        System.out.println(future);
    }
}
```

#### `DateTimeFormatter` 类

- **功能**：用于格式化和解析日期时间，支持自定义日期时间格式。
- **示例**：

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeFormatterExample {
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = now.format(formatter); // 格式化日期时间
        System.out.println(formattedDate);
    }
}
```

这些只是 Java 开发中常用类的一部分，还有许多其他类和接口可以根据具体的开发需求进行使用。

### 键盘录入_Scanner

```java
1.概述:是java定义好的一个类
2.作用:将数据通过键盘录入的形式放到代码中参与运行 
3.位置:java.util
4.使用:
  a.导包:通过导包找到要使用的类 -> 导包位置:类上
    import java.util.Scanner -> 导入的是哪个包下的哪个类
      
  b.创建对象
    Scanner 变量名 = new Scanner(System.in);

  c.调用方法,实现键盘录入
    变量名.nextInt() 输入整数int型的
    变量名.next() 输入字符串  String型的  
```

<img src="D:\BaiduNetdiskDownload\尚硅谷\笔记\day04_流程控制\img\1698825246723.png" alt="1698825246723" style="zoom:80%;" />

```java
public class Demo01Scanner {
    public static void main(String[] args) {
        //创建对象
        Scanner sc = new Scanner(System.in);
        //录入int型整数
        int data1 = sc.nextInt();
        System.out.println("data1 = " + data1);

        //录入String型字符串
        String data2 = sc.next();
        System.out.println("data2 = " + data2);
    }
}

====================================================
public class Demo02Scanner {
    public static void main(String[] args) {
        //创建对象
        Scanner sc = new Scanner(System.in);
        //录入int型整数
        int old1 = sc.nextInt();
        int old2 = sc.nextInt();
        int old3 = sc.nextInt();

        int temp = old1>old2?old1:old2;
        int max = temp>old3?temp:old3;
        System.out.println(max);
    }
}
    
```

> ```java
> 变量名.next():录入字符串 -> 遇到空格和回车就结束录入了
> 变量名.nextLine():录入字符串 -> 遇到回车就结束录入了
> ```
>
> ```java
> public class Demo03Scanner {
>  public static void main(String[] args) {
>      Scanner sc = new Scanner(System.in);
>      String data1 = sc.next();
>      String data2 = sc.nextLine();
>      System.out.println(data1);
>      System.out.println(data2);
>  }
> }
> ```
>
> ```java
> Exception in thread "main" java.util.InputMismatchException -> 输入类型不匹配异常
> 	at java.base/java.util.Scanner.throwFor(Scanner.java:939)
> 	at java.base/java.util.Scanner.next(Scanner.java:1594)
> 	at java.base/java.util.Scanner.nextInt(Scanner.java:2258)
> 	at java.base/java.util.Scanner.nextInt(Scanner.java:2212)
> 	at com.atguigu.a_scanner.Demo04Scanner.main(Demo04Scanner.java:8)
> 
> 原因:录入的数据和要求的数据类型不一致    
> ```

### Random随机数

> 学习Random和学习Scanner方式方法一样

```java
1.概述:java自带的一个类
2.作用:可以在指定的范围内随机一个整数
3.位置:java.util
4.使用:
  a.导包:import java.util.Random
  b.创建对象:
    Random 变量名 = new Random()
  c.调用方法,生成随机数:
    变量名.nextInt() -> 在int的取值范围内随机一个整数
```

```java
public class Demo01Random {
    public static void main(String[] args) {
        //创建对象
        Random rd = new Random();
        int data = rd.nextInt();
        System.out.println("data = " + data);
    }
}
```

```java
在指定范围内随机一个数:
nextInt(int bound) -> 在0-(bound-1)
    
a.nextInt(10) -> 0-9
b.在1-10之间随机一个数: nextInt(10)+1 -> (0-9)+1 -> 1-10
c.在1-100之间随机一个数:nextInt(100)+1 -> (0-99)+1 -> 1-100
d.在100-999之间随机一个数: nextInt(900)+100 -> (0-899)+100 -> 100-999
```

```java
public class Demo02Random {
    public static void main(String[] args) {
        //创建对象
        Random rd = new Random();
        //在1-100之间随机
        int data1 = rd.nextInt(100)+1;
        System.out.println("data1 = " + data1);

        System.out.println("=====================");

        //在100-999之间随机一个数
        int data2 = rd.nextInt(900)+100;
        System.out.println("data2 = " + data2);
    }
}

```

# 模块五  数组

### java内存图

[对象内存图](https://blog.csdn.net/qq_39921135/article/details/139893644?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522b85c65632ca1dc792f895c2747e3ebac%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=b85c65632ca1dc792f895c2747e3ebac&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-139893644-null-null.142^v102^pc_search_result_base2&utm_term=java%E5%86%85%E5%AD%98%E5%9B%BE&spm=1018.2226.3001.4187)

[数组对象图](https://blog.csdn.net/qq_39921135/article/details/139873789?ops_request_misc=&request_id=&biz_id=102&utm_term=java%E5%86%85%E5%AD%98%E5%9B%BE&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-139873789.142^v102^pc_search_result_base2&spm=1018.2226.3001.4187)

![image-20250315193801384](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315193801384.png)

了解一些底层机制帮助理解算法问题

二维数组

```
for（int num：arry
```

）实现循环

数组排序

导入包Array

方法.sort

​	.clone

​	.toString

​	.copyof

​	.binanarySearch

​	.fill

### 1. `java.util.Arrays` 类

- **所属包**：`java.util`
- **功能概述**：该类提供了一系列静态方法，用于对数组进行各种操作，像排序、搜索、填充、比较等。
- 常用方法示例
  - **`sort` 方法**：用于对数组进行排序。

```java
import java.util.Arrays;

public class ArraysSortExample {
    public static void main(String[] args) {
        int[] numbers = {5, 2, 8, 1, 9};
        Arrays.sort(numbers);
        for (int num : numbers) {
            System.out.print(num + " ");
        }
    }
}
```

- **`binarySearch` 方法**：在已排序的数组中使用二分查找法查找指定元素。

```java
import java.util.Arrays;

public class ArraysBinarySearchExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int index = Arrays.binarySearch(numbers, 3);
        System.out.println("元素 3 的索引是: " + index);
    }
}
```

- **`fill` 方法**：用指定的值填充数组。

```java
import java.util.Arrays;

public class ArraysFillExample {
    public static void main(String[] args) {
        int[] numbers = new int[5];
        Arrays.fill(numbers, 10);
        for (int num : numbers) {
            System.out.print(num + " ");
        }
    }
}
```

- **`equals` 方法**：比较两个数组是否相等。

```java
import java.util.Arrays;

public class ArraysEqualsExample {
    public static void main(String[] args) {
        int[] array1 = {1, 2, 3};
        int[] array2 = {1, 2, 3};
        boolean isEqual = Arrays.equals(array1, array2);
        System.out.println("两个数组是否相等: " + isEqual);
    }
}
```

### 2. `java.lang.reflect.Array` 类

- **所属包**：`java.lang.reflect`
- **功能概述**：这个类提供了动态创建和访问 Java 数组的方法，主要用于反射机制。借助反射，你能够在运行时创建数组、获取数组的长度以及访问数组元素。
- 常用方法示例
  - **`newInstance` 方法**：动态创建数组。

```java
import java.lang.reflect.Array;

public class ArrayNewInstanceExample {
    public static void main(String[] args) {
        int[] array = (int[]) Array.newInstance(int.class, 5);
        for (int i = 0; i < array.length; i++) {
            Array.set(array, i, i * 2);
        }
        for (int i = 0; i < array.length; i++) {
            System.out.print(Array.get(array, i) + " ");
        }
    }
}
```

- **`getLength` 方法**：获取数组的长度。

```java
import java.lang.reflect.Array;

public class ArrayGetLengthExample {
    public static void main(String[] args) {
        int[] array = {1, 2, 3, 4, 5};
        int length = Array.getLength(array);
        System.out.println("数组的长度是: " + length);
    }
}
```

### 3. `java.util.stream.Stream` 与数组

- **所属包**：`java.util.stream`

- **功能概述**：Java 8 引入了 Stream API，可用于对数组进行函数式操作，像过滤、映射、归约等。

- 常用操作示例

  ：

  - **过滤操作**：

```java
import java.util.Arrays;
import java.util.stream.IntStream;

public class ArrayStreamFilterExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        IntStream stream = Arrays.stream(numbers);
        stream.filter(num -> num % 2 == 0).forEach(System.out::println);
    }
}
```

- **映射操作**：

```java
import java.util.Arrays;
import java.util.stream.IntStream;

public class ArrayStreamMapExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        IntStream stream = Arrays.stream(numbers);
        stream.map(num -> num * 2).forEach(System.out::println);
    }
}
```

![image-20250306163710886](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250306163710886.png)	

```
注意考虑数组空间问题
```







# 模块六  方法



##### 方法

功能代码块，减少main方法里的定义，好维护

分区:不同对象有不同对象要实现的功能,定义不同的方法

通用定义格式

 ![image-20250227152150638](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227152150638.png)

方法类型：

![image-20250227152219062](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227152219062.png)



##### 无参无返回值:

 void return

**注意事项！！！**

![image-20250227132803638](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227132803638.png)

注意定义完方法，需要在main中调用  （main由虚拟机  JVM执行）

方法调用 按照编写顺序 

![image-20250227155828507](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227155828507.png)

   

![image-20250227161645072](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227161645072.png)

#####  有参无返回值：

参数在方法体里被执行，

使用时直接调用方法:

方法名(参数)

##### 无参有返回值：

打印调用 

赋值调用  变量=方法名()

![image-20250227163235205](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227163235205.png)

#####  有参有放回值：

   ![image-20250227163556748](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227163556748.png)        

形式参数 vs  实际参数(具体值)

以上方法类型取决于是否需要进行参数传递 ，和返回值传递



##### 项目架构思想

页面:  发请求

表现层 (Controller)：接受请求，返回响应

业务层(Service)：业务逻辑

持久层(Dao)：DB相关



SpringMVC

Spring

Mybatics

**三层架构思想**

  ![image-20250227165154096](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227165154096.png)



![image-20250227165415496](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227165415496.png)

  	

![image-20250227170844060](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227170844060.png)

练习

![image-20250227174058582](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227174058582.png)

![image-20250227174119469](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227174119469.png)



![image-20250227183132822](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227183132822.png)

```
return new int[]{sum,sub};

```

![image-20250227183629086](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227183629086.png)

增强型for循环

**方法重载**

方法名相同，参数列表不同（类型，个数，顺序），和参数名，返回值无关

vs **方法重写**

![image-20250227194457316](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250227194457316.png)

# [模块七 面向对象](https://www.bilibili.com/video/BV1YT4y1H7YM?spm_id_from=333.788.videopod.episodes&vd_source=3e5b8596fdf7a1e637fb85e996addeda&p=143)

### 大纲

![image-20250315200037827](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315200037827.png)



### 面对对象的思想



### 匿名对象

1.所谓的匿名对象:其实就是没有等号左边的部分,只有等号右边的部分(对象)
2.使用:
  new 对象().成员
      
3.注意:
  a.如果我们只想单纯的调用一个方法,让方法执行,我们可以考虑使用匿名对象
  b.但是如果涉及到赋值,千万不要用匿名对象    

### 成员变量与局部变量

1.定义位置不同(重点)
  a.成员变量:类中方法外
  b.局部变量:定义在方法之中或者参数位置
      
2.初始化值不同(重点)
  a.成员变量:有默认值的,所以不用先手动赋值,就可以直接使用
  b.局部变量:是没有默认值的,所以需要先手动赋值,再使用
      
3.作用范围不同(重点)
  a.成员变量:作用于整个类
  b.局部变量:只作用于自己所在的方法,其他方法使用不了
      
4.内存位置不同(了解)
  a.成员变量:在堆中,跟着对象走
  b.局部变量:在栈中,跟着方法走

5.生命周期不同(了解)
  a.成员变量:随着对象的创建而产生,随着对象的消失而消失
  b.局部变量:随着方法的调用而产生,随着方法的调用完毕而消失    





# 模块八 封装

### 使用封装

private使外部类不能直接调用

```
  a.关键字:private(私有化的) -> 被private修饰的成员只能在本类中使用,在别的类中使用不了
      
  b.注意:
    将代码放到一个方法中,也是封装的体现
    一个成员被private修饰也是封装的体现,只不过private最具代表性
        
  c.private的使用:
    修饰成员变量:private 数据类型 变量名
    修饰方法:将public改成private,其他的都一样
        
2.问题:属性被私有化了,外界直接调用不了了,那么此时属性就不能直接赋值取值了,所以需要提供公共的接口
       get/set方法
    
      set方法:为属性赋值
      get方法:获取属性值
```

#### eg

```java
public class Person {
    private String name;
    private int age;

    //为name提供get/set方法
    public void setName(String xingMing) {
        name = xingMing;
    }

    public String getName() {
        return name;
    }

    //为age提供get/set方法
    public void setAge(int nianLing) {
        if (nianLing < 0 || nianLing > 150) {
            System.out.println("你脑子是不是秀逗啦!岁数不合理");
        } else {
            age = nianLing;
        }
    }

    public int getAge() {
        return age;
    }
}

public class Test01 {
    public static void main(String[] args) {
        Person person = new Person();
        //person.name = "涛哥";
        //person.age = -18;

        //System.out.println(person.name);
        //System.out.println(person.age);

        person.setName("涛哥");
        person.setAge(18);

        String name = person.getName();
        int age = person.getAge();
        System.out.println(name+"..."+age);
    }
}
```

### this

  **this点出来的一定是成员的变量**

### 构造方法

```
1.概述:方法名和类名一致并且能初始化对象的方法
2.分类:
  a.无参构造:没有参数
  b.有参构造:有参数,参数是为指定的属性赋值
  c.满参构造:给所有属性赋值 
      
  以上构造咱们不用记那么详细,我们就记有参和无参构造就可以了
      
3.特点:
  a.方法名和类名一致
  b.没有返回值,连void都没有
```

![image-20250315201356557](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315201356557.png)

### JavaBean

![image-20250315201707656](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315201707656.png)

byd这样看类图的属性有private 就可以一键解决了

```
1.将来的javabean都是和数据库的表相关联
  a.类名 -> 表名
  b.属性名 -> 列名
  c.对象 -> 表中每一行数据
  d.属性值 -> 表中单元格中的数据
```

# 模块9  面对对象

### 大纲

![image-20250315202435248](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315202435248.png)



# 模块10 继承







## static

static成员储存在栈直接调用即可

![image-20250315202923351](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315202923351.png)

### 可变参数

### 对象数组

### 命令行参数

# 模块11 接口



# 模块12 多态

## 简要理解

~~~markdown
在Java中，多态是面向对象编程的重要特性之一，它允许不同类的对象对同一消息作出不同的响应。简单来说，就是用父类（或接口）的引用指向子类的对象，根据对象的实际类型来调用相应的方法。

多态主要通过以下三种方式实现：
1. **方法重载（Overloading）**：在同一个类中，方法名相同但参数列表不同（参数个数、类型或顺序不同）的多个方法，根据传入的参数不同调用不同的方法。这并不是严格意义上的多态（多态主要指运行时多态），但也体现了一种多态性。
2. **方法重写（Overriding）**：子类重写父类的方法，当父类引用指向子类对象时，调用的是子类重写后的方法。这是运行时多态的体现，根据对象的实际类型调用相应的方法。
3. **接口实现**：实现接口的类重写接口中的方法，当接口引用指向实现类的对象时，调用的是实现类重写后的方法，同样体现了运行时多态。

下面通过一个实际例子来理解多态：

```java
// 定义一个动物类
class Animal {
    public void speak() {
        System.out.println("动物发出声音");
    }
}

// 定义一个猫类，继承自动物类
class Cat extends Animal {
    @Override
    public void speak() {
        System.out.println("猫喵喵叫");
    }
}

// 定义一个狗类，继承自动物类
class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("狗汪汪叫");
    }
}

public class PolymorphismExample {
    public static void main(String[] args) {
        // 多态的使用
        Animal animal1 = new Cat(); // 父类引用指向子类对象
        Animal animal2 = new Dog();

        animal1.speak(); // 调用的是Cat类重写后的speak方法
        animal2.speak(); // 调用的是Dog类重写后的speak方法

        // 方法重载的例子
        System.out.println(add(1, 2)); // 调用第一个add方法
        System.out.println(add(1, 2, 3)); // 调用第二个add方法
    }

    // 方法重载的例子
    public static int add(int a, int b) {
        int result = a + b;
        return result;
    }

    public static int add(int a, int b, int c) {
        int result = a + b + c;
        return result;
    }
}
```

在这个例子中：
- `Animal`类是父类，`Cat`类和`Dog`类是子类，子类重写了父类的`speak`方法。
- 在`main`方法中，`Animal animal1 = new Cat();`和`Animal animal2 = new Dog();`创建了父类引用指向子类对象，调用`animal1.speak()`和`animal2.speak()`时，根据对象的实际类型（`Cat`或`Dog`）调用相应的方法，体现了运行时多态。
- `add`方法是方法重载的例子，在同一个类中定义了两个同名但参数列表不同的方法，根据传入的参数不同调用不同的方法。

多态的好处在于提高了代码的扩展性和可维护性，使得代码更加灵活和易于复用。 
~~~

## 深入理解 （八股文）

~~~markdown
### 深入理解Java多态性

多态（Polymorphism）是面向对象编程的核心概念之一，它允许不同类的对象通过相同的接口进行调用，从而实现代码的灵活性和可扩展性。下面从多个角度深入讲解Java中的多态性。


### 一、多态的实现机制

#### 1. 方法重写（Override）
子类重写父类的方法，在运行时根据对象的实际类型决定调用哪个方法。这是运行时多态的基础。

**关键点**：
- 方法签名（名称、参数列表、返回类型）必须与父类相同
- 访问修饰符不能比父类更严格（如父类是`public`，子类不能是`protected`）
- 抛出的异常不能比父类更宽泛

**示例**：
```java
class Shape {
    public double area() { return 0; }
}

class Circle extends Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }
    @Override
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    private double width, height;
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    @Override
    public double area() { return width * height; }
}
```

#### 2. 向上转型（Upcasting）
将子类对象赋值给父类引用，是多态实现的前提。

```java
Shape circle = new Circle(5.0);  // 向上转型
Shape rectangle = new Rectangle(3.0, 4.0);
```

#### 3. 动态绑定（Dynamic Binding）
Java在运行时根据对象的实际类型（而非引用类型）决定调用哪个方法，这称为动态绑定或后期绑定。

```java
Shape shape = new Circle(5.0);
System.out.println(shape.area());  // 运行时调用Circle.area()
```


### 二、多态的分类

#### 1. 编译时多态（静态多态）
通过方法重载（Overloading）实现，编译器根据参数类型和数量决定调用哪个方法。

**示例**：
```java
class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
}
```

#### 2. 运行时多态（动态多态）
通过方法重写和向上转型实现，运行时动态决定调用哪个方法。

**示例**：
```java
List<String> list = new ArrayList<>();  // 接口引用指向实现类
list.add("Hello");  // 调用ArrayList的add方法
```


### 三、多态的应用场景

#### 1. 方法参数多态
方法接受父类/接口类型的参数，可以传入任何子类对象。

```java
public void printArea(Shape shape) {
    System.out.println("面积: " + shape.area());
}

// 可以传入任何Shape的子类
printArea(new Circle(5.0));
printArea(new Rectangle(3.0, 4.0));
```

#### 2. 集合框架
集合存储的是父类/接口类型，实际元素可以是任何子类对象。

```java
List<Shape> shapes = new ArrayList<>();
shapes.add(new Circle(5.0));
shapes.add(new Rectangle(3.0, 4.0));

for (Shape shape : shapes) {
    System.out.println(shape.area());  // 动态调用子类方法
}
```

#### 3. 接口回调
通过接口引用调用实现类的方法。

```java
interface Drawable {
    void draw();
}

class Circle implements Drawable {
    @Override
    public void draw() { System.out.println("画圆"); }
}

// 使用接口引用调用实现类方法
Drawable drawable = new Circle();
drawable.draw();  // 调用Circle的draw方法
```


### 四、多态的限制与注意事项

#### 1. 静态方法不能被重写
静态方法属于类，而非对象，因此不能实现多态。

```java
class Parent {
    public static void staticMethod() {
        System.out.println("Parent static method");
    }
}

class Child extends Parent {
    public static void staticMethod() {  // 隐藏父类静态方法，而非重写
        System.out.println("Child static method");
    }
}

Parent p = new Child();
p.staticMethod();  // 输出: Parent static method
```

#### 2. 私有方法不能被重写
私有方法对子类不可见，无法实现多态。

#### 3. 字段不参与多态
字段访问由引用类型决定，而非对象类型。

```java
class Parent {
    int value = 10;
}

class Child extends Parent {
    int value = 20;
}

Parent p = new Child();
System.out.println(p.value);  // 输出: 10
```


### 五、多态的优势

1. **代码灵活性**：通过父类/接口引用，可以处理多种子类对象。
2. **可扩展性**：新增子类无需修改现有代码，符合开闭原则。
3. **可维护性**：减少代码冗余，提高代码复用性。


### 六、经典案例分析：策略模式

多态的典型应用是设计模式中的**策略模式**，它将算法封装成独立的策略类，使它们可以互相替换。

**示例**：

```java
// 定义策略接口
interface PaymentStrategy {
    void pay(double amount);
}

// 具体策略类
class CreditCardPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        System.out.println("使用信用卡支付: " + amount);
    }
}

class PayPalPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        System.out.println("使用PayPal支付: " + amount);
    }
}

// 上下文类
class ShoppingCart {
    private PaymentStrategy paymentStrategy;
    
    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }
    
    public void checkout(double amount) {
        paymentStrategy.pay(amount);  // 多态调用
    }
}

// 使用示例
ShoppingCart cart = new ShoppingCart();
cart.setPaymentStrategy(new CreditCardPayment());
cart.checkout(100.0);  // 信用卡支付

cart.setPaymentStrategy(new PayPalPayment());
cart.checkout(200.0);  // PayPal支付
```


### 七、常见面试问题

1. **重载（Overload）和重写（Override）的区别？**
   - 重载：同一类中方法名相同但参数不同，编译时多态
   - 重写：子类重写父类方法，运行时多态

2. **Java如何实现运行时多态？**
   - 通过继承、方法重写、向上转型和动态绑定实现。

3. **静态方法可以被重写吗？**
   - 不能，静态方法属于类，无法实现多态。

4. **多态中字段如何访问？**
   - 字段访问由引用类型决定，而非对象类型。


### 总结
多态是Java面向对象编程的强大工具，它通过方法重写、向上转型和动态绑定实现了代码的灵活性和可扩展性。理解多态的核心机制和应用场景，对于设计高质量的Java程序至关重要。
~~~

## 权限修饰符

~~~markdown
在Java中，权限修饰符用于控制类、方法、变量等的访问范围，确保数据封装和信息隐藏。Java提供了四种访问权限修饰符，按访问范围从大到小排列为：

### 1. `public`（公共的）
- **访问范围**：所有类都可以访问。
- **适用场景**：常用于定义API接口、工具类方法、常量等。
- **示例**：
  ```java
  public class Calculator {
      public static final double PI = 3.14; // 公共常量
      public int add(int a, int b) {        // 公共方法
          return a + b;
      }
  }
  ```

### 2. `protected`（受保护的）
- **访问范围**：
  - 同一个包内的类可以访问。
  - 不同包的子类可以访问（通过继承或引用子类对象）。
- **适用场景**：常用于基类中需要被子类扩展的方法或属性。
- **示例**：
  ```java
  // 基类（包：com.example.parent）
  protected class Animal {
      protected void eat() { // 受保护方法
          System.out.println("Animal eats");
      }
  }

  // 子类（包：com.example.child）
  public class Dog extends Animal {
      public void bark() {
          super.eat(); // 子类可以访问父类的protected方法
      }
  }
  ```

### 3. 默认（无修饰符，包私有）
- **访问范围**：仅同一个包内的类可以访问。
- **适用场景**：用于内部实现细节，不希望被外部包访问。
- **示例**：
  ```java
  class Shape { // 默认访问权限
      double area() { // 默认访问权限
          return 0;
      }
  }
  ```

### 4. `private`（私有的）
- **访问范围**：仅在定义它的类内部可以访问。
- **适用场景**：常用于封装类的内部状态，防止外部直接访问。
- **示例**：
  ```java
  public class Person {
      private String name; // 私有字段
      
      public String getName() { // 公共访问器
          return name;
      }
      
      private void validateName() { // 私有方法
          // 内部验证逻辑
      }
  }
  ```

### 权限修饰符对比表

| 修饰符    | 同一个类 | 同一个包 | 不同包子类 | 不同包非子类 |
|-----------|----------|----------|------------|--------------|
| `public`  | ✅        | ✅        | ✅          | ✅            |
| `protected` | ✅        | ✅        | ✅          | ❌            |
| 默认      | ✅        | ✅        | ❌          | ❌            |
| `private` | ✅        | ❌        | ❌          | ❌            |

### 注意事项
1. **类的访问限制**：
   - 外部类只能是`public`或默认权限。
   - 内部类可以使用所有四种权限修饰符。

2. **继承规则**：
   - 子类重写父类方法时，访问权限不能更严格（例如，父类`protected`方法，子类重写时只能是`protected`或`public`）。

3. **接口成员**：
   - 接口中的方法默认是`public`，不能使用其他修饰符。
   - 接口中的字段默认是`public static final`。

合理使用权限修饰符可以提高代码的安全性和可维护性，遵循**最小权限原则**（仅授予必要的访问权限）是良好的编程实践。
~~~

## 局部内部类和匿名内部类

~~~markdown

### Java局部内部类深度解析


局部内部类（Local Inner Class）是Java内部类中最“低调”的一种，但它在封装临时逻辑、避免类名污染等场景中扮演着重要角色。本文将从定义、作用域、访问规则、底层原理到实际应用，全面深入讲解。


---


### **一、局部内部类的本质与定义**
#### **1. 本质**  
局部内部类是**定义在方法、构造器或代码块内部的类**，其作用域严格限制在所在的块（方法/构造器/代码块）内。它的核心价值是**封装仅在特定上下文中使用的功能**，避免全局类名污染。


#### **2. 定义语法**  
局部内部类必须定义在**块作用域**（如方法体、构造器、静态代码块）内部，语法如下：  
```java
public class Outer {
    // 外部类成员
    private int outerField = 10;

    // 方法（局部内部类定义在此方法中）
    public void outerMethod() {
        int localVar = 20; // 方法内的局部变量

        // 局部内部类（定义在方法内）
        class LocalInner {
            // 内部类成员
            public void innerMethod() {
                System.out.println("外部类字段: " + outerField); // 访问外部类成员
                System.out.println("方法局部变量: " + localVar);   // 访问方法内的局部变量
            }
        }

        // 在方法内创建并使用局部内部类对象
        LocalInner inner = new LocalInner();
        inner.innerMethod();
    }
}
```


---


### **二、局部内部类的核心特性**
#### **1. 作用域限制：仅在定义它的块内可见**  
局部内部类的作用域严格限制在**定义它的方法/构造器/代码块**内，外部无法直接访问。例如：  
```java
public class Test {
    public static void main(String[] args) {
        Outer outer = new Outer();
        outer.outerMethod(); // 可以调用outerMethod()
        // LocalInner inner = new LocalInner(); // 编译错误：LocalInner不可见
    }
}
```


#### **2. 无访问修饰符：“裸奔”的类**  
局部内部类不能使用`public`、`private`、`protected`等访问修饰符（因为作用域是局部的，修饰符无意义），也不能用`static`修饰（静态内部类需定义在类层级，而非方法内）。  


#### **3. 访问外部类成员：隐式持有外部类引用**  
局部内部类可以直接访问外部类的所有成员（包括`private`成员），因为它**隐式持有外部类对象的引用**（`Outer.this`）。  

**示例：**  
```java
public class Outer {
    private String name = "外部类";

    public void outerMethod() {
        // 局部内部类
        class LocalInner {
            public void print() {
                // 直接访问外部类的private成员
                System.out.println(name); // 输出：外部类
                // 显式使用Outer.this（可选）
                System.out.println(Outer.this.name); // 输出：外部类
            }
        }

        new LocalInner().print();
    }
}
```


#### **4. 访问局部变量：JDK8前后的差异**  
局部内部类可以访问所在方法内的局部变量，但需满足以下规则：  

| **JDK版本** | **规则**                                                                 | **示例**                                                                 |
|-------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------|
| **JDK7及之前** | 局部变量必须显式声明为`final`（不可修改）。                                | `final int localVar = 20;`（若修改`localVar = 30;`，编译错误）            |
| **JDK8及之后** | 局部变量隐式为`final`（可省略`final`关键字，但仍不可修改，称为“effectively final”）。 | `int localVar = 20;`（若尝试修改`localVar = 30;`，编译错误）             |

**原因**：  
局部变量的生命周期与局部内部类对象的生命周期不同：  
- 局部变量（如`localVar`）在方法结束后被销毁。  
- 局部内部类对象可能在方法结束后仍存在（例如被返回给外部）。  

为了保证局部内部类对象能正确访问局部变量，Java通过**复制局部变量的值到内部类对象中**实现。若局部变量被修改，会导致内部类对象中的复制值与原始值不一致，因此Java强制要求局部变量不可修改。


---


### **三、局部内部类的底层实现（编译原理）**
Java编译器会将局部内部类编译为独立的`.class`文件，命名规则为：  
```
外部类名$N局部内部类名.class  
```  
其中`N`是数字（用于区分同一外部类中多个局部内部类或不同位置的局部类）。  

例如，前面的`Outer`类中的`LocalInner`会被编译为`Outer$1LocalInner.class`。  


#### **关键编译细节**  
1. **外部类引用的注入**：  
   局部内部类的构造器会隐式接收外部类对象的引用（`Outer.this`），通过这个引用访问外部类成员。  

2. **局部变量的复制**：  
   局部内部类会将访问的局部变量（如`localVar`）作为成员变量保存，通过构造器参数传入其值。因此，即使方法结束后局部变量被销毁，内部类对象仍能访问复制后的值。  


---


### **四、局部内部类的使用场景**
局部内部类适用于**仅在单个方法中需要特定功能**的场景，常见场景如下：  


#### **场景1：封装临时功能（避免全局类污染）**  
当某个功能仅在一个方法中使用时，用局部内部类封装可以避免定义全局类，减少命名冲突。  

**示例：统计数组最大值（仅在方法中使用）**  
```java
public class DataProcessor {
    public void processArray(int[] data) {
        // 局部内部类：计算最大值（仅在此方法中使用）
        class MaxCalculator {
            public int getMax() {
                int max = data[0];
                for (int num : data) {
                    if (num > max) max = num;
                }
                return max;
            }
        }

        MaxCalculator calculator = new MaxCalculator();
        System.out.println("数组最大值: " + calculator.getMax());
    }

    public static void main(String[] args) {
        DataProcessor processor = new DataProcessor();
        processor.processArray(new int[]{3, 5, 2, 8, 1}); // 输出：8
    }
}
```


#### **场景2：实现接口的“具名”临时类**  
当需要为某个接口提供一个仅在方法中使用的实现类时，局部内部类是匿名内部类的“具名替代方案”（如果需要复用实现逻辑）。  

**示例：实现Printer接口**  
```java
interface Printer {
    void print(String msg);
}

public class Demo {
    public void doPrint() {
        // 局部内部类实现Printer接口（具名）
        class ConsolePrinter implements Printer {
            @Override
            public void print(String msg) {
                System.out.println("控制台打印: " + msg);
            }
        }

        // 多次使用同一局部内部类
        Printer printer1 = new ConsolePrinter();
        Printer printer2 = new ConsolePrinter();
        printer1.print("消息1");
        printer2.print("消息2");
    }

    public static void main(String[] args) {
        new Demo().doPrint(); 
        // 输出：控制台打印: 消息1；控制台打印: 消息2
    }
}
```


#### **场景3：复杂逻辑的分块封装**  
在长方法中，用局部内部类将复杂逻辑分块，提高代码可读性。  

**示例：用户验证逻辑（分块处理）**  
```java
public class UserService {
    public void validateUser(String username, String password) {
        // 局部内部类：验证用户名
        class UsernameValidator {
            public boolean isValid() {
                return username != null && username.length() >= 6;
            }
        }

        // 局部内部类：验证密码
        class PasswordValidator {
            public boolean isValid() {
                return password != null && password.matches("^[a-zA-Z0-9]{8,}$");
            }
        }

        // 使用局部类验证
        boolean isUsernameValid = new UsernameValidator().isValid();
        boolean isPasswordValid = new PasswordValidator().isValid();
        System.out.println("验证结果: " + (isUsernameValid && isPasswordValid));
    }
}
```


---


### **五、局部内部类 vs 其他内部类**
| **类型**         | **定义位置**       | **作用域**               | **访问外部变量**                     | **典型用途**                     |
|-------------------|--------------------|--------------------------|--------------------------------------|----------------------------------|
| **局部内部类**    | 方法/构造器/代码块 | 仅所在块内               | 可访问外部类所有成员；局部变量需final | 封装临时功能、实现接口的具名类   |
| **成员内部类**    | 类内部，非静态     | 整个外部类               | 可访问外部类所有成员                 | 与外部类强关联的辅助类           |
| **静态内部类**    | 类内部，static修饰 | 整个外部类               | 仅可访问外部类静态成员               | 独立于外部类实例的辅助类         |
| **匿名内部类**    | 方法/构造器内部    | 仅所在块内               | 同局部内部类                        | 一次性实现接口或继承抽象类       |


---


### **六、注意事项**
1. **无法定义静态成员（JDK16前）**：  
   局部内部类不能定义`static`变量或方法（JDK16+允许定义`static final`常量）。例如：  
   ```java
   class Outer {
       public void method() {
           class LocalInner {
               // static int x = 10; // JDK16前编译错误（JDK16+允许static final）
               static final int CONST = 100; // JDK16+合法
           }
       }
   }
   ```

2. **构造器的隐式参数**：  
   局部内部类的构造器会隐式接收外部类对象引用（`Outer.this`）和访问的局部变量值（通过编译时生成的构造器参数）。

3. **避免过度使用**：  
   局部内部类虽能封装逻辑，但过度使用会导致方法代码膨胀，降低可读性。复杂逻辑建议拆分为独立类。


---


### **总结**  
局部内部类是Java中“小而美”的工具，核心价值是**在特定上下文中封装临时功能**，避免全局类名污染。理解其作用域、访问规则和底层原理，能帮助我们在实际开发中更灵活地使用它，写出更简洁、更易维护的代码。
~~~



# 模块13 异常



# 模块14 string类

```markdown
在Java中，`String`类代表字符串，是引用数据类型，不是基本数据类型 。主要特点和相关知识如下：
### 特点
- **不可变性** ：被声明为`final`，不可被继承。内部用`private final char[] value`存储字符序列，这使得字符串内容不可修改。对字符串进行操作，如重新赋值、连接、替换等，都会返回新的`String`对象。例如`String s = "abc"; s = s + "d";`，实际产生了两个字符串对象`"abc"`和`"abcd"` 。
- **常量池** ：通过字面量（如`String s = "hello";` ）创建字符串时，会先在字符串常量池中查找，若存在则直接引用；若不存在则创建新的字符串对象并放入常量池。常量池中不会存储相同内容的字符串。而使用`new String("hello")` 会在堆内存创建对象，同时可能涉及常量池中的对象 。
- **实现接口** ：实现了`Serializable`接口，支持序列化，可在网络传输等场景使用；实现了`Comparable`接口，可用于比较大小 。 

### 常用构造方法
- `String()` ：创建一个表示空字符序列的字符串对象。
- `String(char[] value)` ：根据字符数组创建字符串。
- `String(byte[] bytes)` ：通过字节数组，使用平台默认字符集解码来创建字符串 。 

### 常用方法 
- **获取相关** ：`length()`获取字符串长度；`charAt(int index)`返回指定索引处的字符 。
- **比较相关** ：`equals(Object anObject)`比较内容是否相等；`equalsIgnoreCase(String anotherString)`忽略大小写比较；`compareTo(String anotherString)`按字典序比较大小 。 
- **操作相关** ：`concat(String str)`连接字符串；`substring(int beginIndex)`或`substring(int beginIndex, int endIndex)`截取子串；`replace(char oldChar, char newChar)`或`replace(CharSequence target, CharSequence replacement)`替换字符或子串 ；`split(String regex)`按正则表达式拆分字符串 。
- **转换相关** ：`toLowerCase()`转换为小写；`toUpperCase()`转换为大写；`trim()`去除首尾空白字符 。 
```

