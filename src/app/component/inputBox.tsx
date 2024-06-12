'use client'

import { addMessageToList } from "@/redux/slices/chatSlice";
import { useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAppDispatch } from '@/redux/hooks';

export default function InputBox() {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const handleInputChange = (event: any) => {
        setInputValue(event.target.value);
    };

    const handleSearch = async (event: any) => {
        event.preventDefault();
        if (loading) return; // 이미 로딩 중일 때는 중복 클릭 방지

        dispatch(addMessageToList({ content: inputValue, speaker: 'human' }));
        setInputValue(''); // 메시지 전송 후 입력 필드 초기화
        setLoading(true); // 로딩 상태로 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃 설정

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ question: inputValue }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId); // 타임아웃 해제
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const test = await response;
            console.log(test)
            const responseJson = await response.json();
            console.log(responseJson);
            const chatMessages = responseJson.data.messages;
            dispatch(addMessageToList(chatMessages[chatMessages.length - 1]));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // 로딩 상태 해제
        }
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(event);
        }
    };

    return (
        <div className="flex w-full bg-[#F4F4F4] rounded-lg px-3 py-2 mb-6 mt-4 border-2 border-[#F4F4F4] focus-within:border-2 focus-within:border-red-300 group">
            <input
                placeholder="메시지 입력"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full focus:outline-none bg-transparent text-slate-600"
            />
            <div className="flex-grow"></div>
            <button className="flex justify-end" onClick={handleSearch} disabled={loading}>
                {loading ? <AiOutlineLoading3Quarters className="w-7 h-7 animate-spin" /> : <TiLocationArrow className="w-7 h-7" />}
            </button>
        </div>
    );
}
