import { ReactHTMLElement, useState, useEffect } from "react";
import localforage from "localforage";
import { FormDialog } from "./FormDialog";
import { TodoItem } from "./TodoItem";
import { ToolBar } from "./ToolBar";
import { SideBar } from "./SideBar";
import { QR } from "./QR";
import { ActionButton } from "./ActionButton";
import { AlertDialog } from "./AlertDialog";
import GlobalStyles from "@mui/material/GlobalStyles";
// スタイルエンジンのモジュールとカラーをインポート
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { indigo, pink } from "@mui/material/colors";
import { isTodos } from "./lib/isTodo";

// テーマを作成
const theme = createTheme({
  palette: {
    primary: {
      main: indigo[500],
      light: "#757de8",
      dark: "#002984",
    },
    // ついでにセカンダリーカラーも v4 に戻す
    secondary: {
      main: pink[500],
      light: "#ff6090",
      dark: "#b0003a",
    },
  },
});

export const App = () => {
  const [text, setText] = useState("");
  const [todos, setTodo] = useState<ToDo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [drawer, setDrawer] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const onToggleDrawer = () => setDrawer(!drawer); //sidebarの開閉メソッド

  const onToggleQR = () => setQrOpen(!qrOpen); //QRコードの開閉メソッド

  const onToggleDialog = () => {
    setDialogOpen(!dialogOpen);
    setText(""); //入力欄をクリア
  };

  const onToggleAlert = () => setAlertOpen(!alertOpen); //ゴミ箱を空にするアラートの開閉メソッド

  const handleOnSort = (filter: Filter) => {
    setFilter(filter);
  };

  const handleOnSubmit = () => {
    if (!text) {
      setDialogOpen(false); //入力欄を閉じる
      return;
    }

    const newTodo: ToDo = {
      value: text,
      id: new Date().getTime(),
      checked: false,
      removed: false,
    };

    setTodo([newTodo, ...todos]);
    setText("");
    setDialogOpen(false); //入力欄を閉じる
  };

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setText(e.target.value);
  };

  const handleOnEmpty = () => {
    //removedFlagが立っている要素を取り除く。プロパティを編集するわけでないのでしゃろーこぴーで事足りる

    const newTodos = todos.filter((todo) => {
      !todo.removed;
    });
    setTodo(newTodos);
  };

  const handleOnTodo = <T extends ToDo, U extends keyof ToDo, V extends T[U]>(
    obj: T,
    key: U,
    value: V
  ) => {
    //deepCopy
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === obj.id) {
        todo[key] = value;
      }
      return todo;
    });
    setTodo(newTodos);
  };

  //以下、IndexDBへのデータ保存

  /**
   * キー名 'todo-20200101' のデータを取得
   * 第 2 引数の配列が空なのでコンポーネントのマウント時のみに実行される
   */

  useEffect(() => {
    localforage.getItem("20230104-todo").then((values) => {
      isTodos(values) && setTodo(values); //型アサーションでToDO[]だと教える
    });
  }, []);

  /**
   * todos ステートが更新されたら、その値を保存
   */

  useEffect(() => {
    localforage.setItem("20230104-todo", todos);
  }, [todos]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={{ body: { margin: 0, padding: 0 } }} />
      <ToolBar filter={filter} onToggleDrawer={onToggleDrawer} />
      <SideBar
        drawerOpen={drawer}
        onToggleDrawer={onToggleDrawer}
        onToggleQR={onToggleQR}
        onSort={handleOnSort}
      />
      <QR open={qrOpen} onClose={onToggleQR} />
      <FormDialog
        text={text}
        dialogOpen={dialogOpen}
        onToggleDialog={onToggleDialog}
        onSubmit={handleOnSubmit}
        onChange={handleOnChange}
      />
      <AlertDialog
        alertOpen={alertOpen}
        onToggleAlert={onToggleAlert}
        onEmpty={handleOnEmpty}
      />
      <TodoItem todos={todos} filter={filter} handleOnTodo={handleOnTodo} />
      <ActionButton
        todos={todos}
        filter={filter}
        alertOpen={alertOpen}
        dialogOpen={dialogOpen}
        onToggleAlert={onToggleAlert}
        onToggleDialog={onToggleDialog}
      />
    </ThemeProvider>
  );
};

//　ジェネリクス使う前のメソッド
// const handleOnEdit = (id: number, value: string) => {
//   //deepCopy
//   const deepCopy = todos.map((todo) => ({ ...todo }));

//   const newTodos = deepCopy.map((todo) => {
//     if (todo.id === id) {
//       todo.value = value;
//     }
//     return todo;
//   });
//   setTodo(newTodos);
// };

// const handleOnCheck = (id: number, checked: boolean) => {
//   //deepCopy
//   const deepCopy = todos.map((todo) => ({ ...todo }));

//   const newTodos = deepCopy.map((todo) => {
//     if (todo.id === id) {
//       todo.checked = !checked;
//     }
//     return todo;
//   });
//   setTodo(newTodos);
// };

// const handleOnRemove = (id: number, removed: boolean) => {
//   //deepCopy
//   const deepCopy = todos.map((todo) => ({ ...todo }));

//   const newTodos = deepCopy.map((todo) => {
//     if (todo.id === id) {
//       todo.removed = !removed;
//     }
//     return todo;
//   });
//   setTodo(newTodos);
// };
