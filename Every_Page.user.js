// ==UserScript==
// @name        Every Page
// @namespace        http://tampermonkey.net/
// @version        2.0
// @description        「記事の編集・削除」のリストで「常設 styleタグ」を自動記入する
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/entry/srventrylist*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdate*
// @run-at        document-start
// @grant        none
// @updateURL        https://github.com/personwritep/Every_Page/raw/main/Every_Page.user.js
// @downloadURL        https://github.com/personwritep/Every_Page/raw/main/Every_Page.user.js
// ==/UserScript==


window.addEventListener('DOMContentLoaded', function(){ // CSSデザインを適用するためのスクリプト
    let style=
        '<style>'+
        '.entryComplete__textContainer, .entryComplete__paidPlanContainer, '+
        '.entryComplete__contents, .save-gsc, .adcrossBanner { display: none !important; } '+
        '#globalHeader, #ucsHeader, #ucsMainLeft h1, .l-ucs-sidemenu-area, .selection-bar { '+
        'display: none !important; } '+

        '#ucsContent { width: 930px !important; } '+
        '#ucsContent::before { display: none; } '+
        '#ucsMainLeft { width: 930px !important; padding: 0 15px !important; } '+
        '#sorting { margin: 0 0 4px; } '+
        '#sorting ul { display: none; } '+
        '</style>';

    document.head.insertAdjacentHTML('beforeend', style);

});



window.addEventListener('load', function(){ // 孫ウインドウで働くスクリプト
    let body_id=document.body.getAttribute("id");
    if(body_id=="entryCreate"){ // 孫ウインドウ

        select_e(close_w);

        function select_e(close_w){
            let error_report=document.querySelector('h1.p-error__head');
            if(error_report==null){
                if(window.opener){
                    report('gray');
                    window.opener.close(); }} // エラー無い場合 grayを送信　子ウインドウを閉じる
            else{
                if(window.opener){
                    report('red');
                    window.opener.location.reload();
                }} // エラー報告のある場合は redを送信　子ウインドウを残す
            close_w(); }

        function close_w(){
            let close_button=document.querySelector('.entryComplete__close');
            close_button.click(); } // 孫ウインドウは常に閉じる

        function report(color){
            window.opener.document.querySelector('html').style.color=color; }}});



window.addEventListener('load', function(){ // 親ウインドウで働くメインスクリプト
    let entry_target=document.querySelectorAll('.entry-item .entry');
    let entry_id=document.querySelectorAll('input[name="entry_id"]');
    let publish_f=document.querySelectorAll('input[name="publish_flg"]');
    let list_bar=document.querySelectorAll('#entryList .entry-item');
    let new_win=Array(entry_target.length);
    let link_target=Array(entry_target.length);
    let result_f=Array(entry_target.length);


    let body_id=document.body.getAttribute('id');
    if(body_id=="entryListEdit"){
        let start_button=
            '<p id="start_ep">Start Processing'+
            '<style>'+
            '#sorting { position: relative; } '+
            '#start_ep { position: absolute; top: 4px; right: 15px; font: bold 14px Meiryo; '+
            'width: auto; padding: 1px 15px 0; border: 1px solid #aaa; border-radius: 4px; '+
            'background: #fff; cursor: pointer; }'+
            '</style></p>';

        let sorting=document.querySelector('#sorting');
        if(sorting){
            sorting.insertAdjacentHTML('beforeend', start_button); }

        let start_ep=document.querySelector('#start_ep');
        if(start_ep){
            start_ep.onclick=function(){ start_select(); };

            function start_select(){
                sorting.removeChild(start_ep);
                if(entry_target.length==0 || entry_target==null){ // 編集対象がリストに無い場合
                    alert('編集対象の記事がありません'); }
                if(entry_target.length >0){ // 編集対象がリストに有る場合
                    let ok=confirm('このページの対象記事：' + entry_target.length + '\n ⏬タグ記入を実行しますか？');
                    if(ok){ open_all(); }}}
        }}


    function open_all(){
        open_win(0);
        if(entry_target.length>1){
            let k=1;
            let slow_open=setInterval( function(){
                open_win(k);
                k +=1;
                if(k>=entry_target.length){ clearInterval(slow_open); }}, 4000); }} // 4secの間隔で自動実行 ⭕


    function open_win(k){
        result_f[k]=0;

        link_target[k]='/ucs/entry/srventryupdateinput.do?id='+ entry_id[k].value;
        let top_p=100 + 30*k;
        new_win[k]=window.open(link_target[k], k, 'top=' + top_p + ', left=100, width=600, height=180');

        result_f[k]=1; // 読込み開始
        list_bar[k].style.boxShadow='inset 0 0 0 2px #03a9f4'; // リスト欄に青枠表示

        new_win[k].addEventListener('load', function(){
            setTimeout( function(){
                edit_target(publish_f[k].value, k); }, 500); });} // 子ウインドウで書込み開始


    function edit_target(val,k){
        // 以下の style_textを編集すると、書込まれる styleタグの内容を変更出来ます ⭕⭕⭕⭕⭕
        let style_text=
            '<style class="asa" type="text/css">'+
            '@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"); '+
            '</style>';

        let editor_flg=new_win[k].document.querySelector('input[name="editor_flg"]');

        if(editor_flg.value=='5'){ // 最新版エディタの文書の場合
            let editor_iframe=new_win[k].document.querySelector('.cke_wysiwyg_frame');
            let iframe_doc=editor_iframe.contentWindow.document;
            if(iframe_doc){
                let style_tag=iframe_doc.querySelector('style.asa');
                let iframe_body=iframe_doc.querySelector('body.cke_editable');

                if(style_tag){
                    result_f[k]=2; // 無処理
                    list_bar[k].style.boxShadow='none';
                    list_bar[k].style.backgroundColor='#e5f4f3';
                    new_win[k].close(); } // タグが有れば子ウインドウを閉じ 背景 淡グリーン
                else{
                    iframe_body.insertAdjacentHTML('beforeend', style_text); // styleタグ書込み
                    twice(end_do,k); }}} // 書き込みして送信

        if(editor_flg.value=='1'){ // タグ編集エディタの文書の場合
            let preview=new_win[k].document.querySelector('#js-light-preview');
            let tageditor_text=new_win[k].document.querySelector('#entryTextArea');
            let style_tag=preview.querySelector('style.asa');

            if(style_tag){
                result_f[k]=2; // 無処理
                list_bar[k].style.boxShadow='none';
                list_bar[k].style.backgroundColor='#e5f4f3';
                new_win[k].close(); } // タグが有れば子ウインドウを閉じ 背景 淡グリーン
            else{
                tageditor_text.insertAdjacentHTML('beforeend', style_text); // styleタグ書込み
                twice(end_do,k); }} // 書き込みして送信


        function twice(end_do,k){
            setTimeout( function(){
                publish_do(val,k); }, 500);
            end_do(k); }

        function end_do(k){
            result_f[k]=3; // 送信処理
            new_win[k].addEventListener('beforeunload', flag_line , false); }

        function flag_line(){
            let send_color=new_win[k].document.querySelector('html').style.color;
            if(send_color=='gray'){
                result_f[k]=4; // 正常終了の報告
                list_bar[k].style.boxShadow='none';
                list_bar[k].style.backgroundColor='#bae5ea'; } // 孫の正常終了で　背景グリーン
            if(send_color=='red'){
                result_f[k]=5; // エラー終了の報告
                list_bar[k].style.boxShadow='inset 0 0 0 2px red';
                list_bar[k].style.backgroundColor='#ffffff'; }} // 孫のエラー報告の場合は　背景白 赤枠

        function publish_do(val,k){
            let publish_b0=new_win[k].document.querySelector('button.js-submitButton[publishflg="0"]');
            let publish_b1=new_win[k].document.querySelector('button.js-submitButton[publishflg="1"]');
            if(val==0){ publish_b0.click(); }
            if(val==1){ publish_b1.click(); }
            if(val==2){ publish_b0.click(); }}}

});
