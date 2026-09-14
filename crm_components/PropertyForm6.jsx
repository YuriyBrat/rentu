'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Grid,
   TextField,
   Button,
   ToggleButton,
   ToggleButtonGroup,
   Divider,
   Chip,
   MenuItem,
   Alert,
   CircularProgress,
} from '@mui/material';

import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

import RentOptionsSection from './RentOptionsSection2';
import OwnersSection from './OwnersSection3';
import DynamicListField from './DynamicListField';

import { BUSINESS_SCORE_OPTIONS } from '../utils/crm/BusinessScore';
import {
   SAFE_IMAGE_FILE_BYTES,
   SAFE_IMAGE_PAYLOAD_BYTES,
   formatImageBytes,
   isHeicFile,
   prepareImageUploadFiles,
} from '@/utils/crm/clientImageTools';

const PHOTO_STAGES = [
   { value: 'draft', label: 'Р В§Р С•РЎР‚Р Р…Р С•Р Р†РЎвЂ“' },
   { value: 'processed', label: 'Р С›Р В±РЎР‚Р С•Р В±Р В»Р ВµР Р…РЎвЂ“' },
   { value: 'branded', label: 'Р вЂ” Р В»Р С•Р С–Р С•' },
];

const ESTATE_TYPES = [
   { value: 'flat', label: 'Р С™Р Р†Р В°РЎР‚РЎвЂљР С‘РЎР‚Р В°' },
   { value: 'house', label: 'Р вЂРЎС“Р Т‘Р С‘Р Р…Р С•Р С”' },
   { value: 'land', label: 'Р вЂќРЎвЂ“Р В»РЎРЏР Р…Р С”Р В°' },
   { value: 'commerce', label: 'Р С™Р С•Р СР ВµРЎР‚РЎвЂ РЎвЂ“РЎРЏ' },
];

const DEAL_TYPES = [
   { value: 'Р С—РЎР‚Р С•Р Т‘Р В°Р В¶', label: 'Р СџР В Р С›Р вЂќР С’Р вЂ“' },
   { value: 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°', label: 'Р С›Р В Р вЂўР СњР вЂќР С’' },
];

const CURRENCIES = ['USD', 'UAH', 'EUR'];

const ORIGIN_ACTION_OPTIONS = [
   { value: '', label: 'Р Р…Р Вµ Р Р†Р С”Р В°Р В·Р В°Р Р…Р С•' },
   { value: 'review', label: 'Р С•Р С–Р В»РЎРЏР Т‘' },
   { value: 'showing', label: 'Р Р…Р В°РЎРѓР В»РЎвЂ“Р Т‘Р С•Р С” Р С—Р С•Р С”Р В°Р В·РЎС“' },
];

const USING_COMMERCE = [
   'Р С›РЎвЂћРЎвЂ“РЎРѓ',
   'Р С™Р В°РЎвЂћР Вµ/РЎР‚Р ВµРЎРѓРЎвЂљР С•РЎР‚Р В°Р Р…',
   'Р СљР В°Р С–Р В°Р В·Р С‘Р Р…',
   'Р РЋР С”Р В»Р В°Р Т‘',
   'Р вЂњР С•РЎвЂљР ВµР В»РЎРЉ',
   'Р вЂ™Р С‘РЎР‚Р С•Р В±Р Р…Р С‘РЎвЂ РЎвЂљР Р†Р С•',
   'Р С™Р С•Р Р†Р С•РЎР‚Р С”РЎвЂ“Р Р…Р С–',
   'Р СљР ВµР Т‘Р С‘РЎвЂЎР Р…Р Вµ',
   'Р вЂ Р Р…РЎв‚¬Р Вµ',
];

const BUILDING_COMMERCE = [
   'Р В¤Р В°РЎРѓР В°Р Т‘Р Р…Р Вµ Р В· Р С•Р С”РЎР‚Р ВµР СР С‘Р С Р Р†РЎвЂ¦Р С•Р Т‘Р С•Р С',
   'Р вЂРЎвЂ“Р В·Р Р…Р ВµРЎРѓ-РЎвЂ Р ВµР Р…РЎвЂљРЎР‚',
   'Р СћР С•РЎР‚Р С–Р С•Р Р†Р С‘Р в„– РЎвЂ Р ВµР Р…РЎвЂљРЎР‚',
   'Р С›Р С”РЎР‚Р ВµР СР В° Р В±РЎС“Р Т‘РЎвЂ“Р Р†Р В»РЎРЏ',
   'Р СњР ВµР В¶Р С‘РЎвЂљР В»Р С•Р Р†Р С‘Р в„– РЎвЂћР С•Р Р…Р Т‘',
   'Р вЂ“Р С‘РЎвЂљР В»Р С•Р Р†Р С‘Р в„– РЎвЂћР С•Р Р…Р Т‘',
   'Р вЂєР С•Р С–РЎвЂ“РЎРѓРЎвЂљР С‘РЎвЂЎР Р…Р С‘Р в„– Р С”Р С•Р СР С—Р В»Р ВµР С”РЎРѓ',
   'Р С’Р Р…Р С–Р В°РЎР‚',
];

const COMMERCE_SUBTYPE = ['Р С’Р Р†РЎвЂљР С•Р СР С‘Р в„–Р С”Р В°', 'Р С’Р вЂ”Р РЋ', 'Р С’Р С—РЎвЂљР ВµР С”Р В°', 'Р СџР ВµРЎР‚РЎС“Р С”Р В°РЎР‚Р Р…РЎРЏ', 'Р РЋР В°Р В»Р С•Р Р… Р С”РЎР‚Р В°РЎРѓР С‘', 'Р РЋР СћР С›'];

const BUILDING_FLAT = [
   'Р С’Р Р†РЎРѓРЎвЂљРЎР‚РЎвЂ“Р в„–РЎРѓРЎРЉР С”Р С‘Р в„–',
   'Р СџР С•Р В»РЎРЉРЎРѓРЎРЉР С”Р С‘Р в„–',
   'Р РЋРЎвЂљР В°Р В»РЎвЂ“Р Р…Р С”Р В°',
   'Р ТђРЎР‚РЎС“РЎвЂ°Р С•Р Р†Р С”Р В°',
   'Р В§Р ВµРЎв‚¬Р С”Р В°',
   'Р СљР В°Р В»Р С•РЎРѓРЎвЂ“Р СР ВµР в„–Р С”Р В°',
   'Р СњР С•Р Р†Р С•Р В±РЎС“Р Т‘Р С•Р Р†Р В° 2000-2010',
   'Р СњР С•Р Р†Р С•Р В±РЎС“Р Т‘Р С•Р Р†Р В° 2010-2020',
   'Р СњР С•Р Р†Р С•Р В±РЎС“Р Т‘Р С•Р Р†Р В° Р Р†РЎвЂ“Р Т‘ 2020',
];

const WALLS = ['Р В¦Р ВµР С–Р В»Р В°', 'Р СџР В°Р Р…Р ВµР В»РЎРЉ', 'Р вЂР В»Р С•Р С”', 'Р вЂР ВµРЎвЂљР С•Р Р…', 'Р вЂќР ВµРЎР‚Р ВµР Р†Р С•'];

const HOUSE_TYPES = ['Р вЂРЎС“Р Т‘Р С‘Р Р…Р С•Р С”', 'Р вЂќР В°РЎвЂЎР В°', 'Р С™Р С•РЎвЂљР ВµР Т‘Р В¶', 'Р С›РЎРѓР С•Р В±Р Р…РЎРЏР С”', 'Р РЋР В°Р Т‘Р С‘Р В±Р В°', 'Р СћР В°РЎС“Р Р…РЎвЂ¦Р В°РЎС“РЎРѓ', 'Р В§Р В°РЎРѓРЎвЂљР С‘Р Р…Р В° Р В±РЎС“Р Т‘Р С‘Р Р…Р С”РЎС“'];

const AREA_UNITS = ['Р РЋР С•РЎвЂљР С•Р С”', 'Р вЂњР В°'];

const PURPOSE_LAND = [
   'Р С—РЎвЂ“Р Т‘ Р В¶Р С‘РЎвЂљР В»Р С•Р Р†РЎС“ Р В·Р В°Р В±РЎС“Р Т‘Р С•Р Р†РЎС“',
   'Р В±Р В°Р С–Р В°РЎвЂљР С•Р С”Р Р†Р В°РЎР‚РЎвЂљР С‘РЎР‚Р Р…Р С•Р С–Р С•',
   'Р С”Р С•Р СР ВµРЎР‚РЎвЂ РЎвЂ“Р в„–Р Р…Р С•Р С–Р С•',
   'Р С—РЎР‚Р С•Р СР С‘РЎРѓР В»Р С•Р Р†Р С•Р С–Р С•',
   'РЎРѓРЎвЂ“Р В»РЎРЉРЎРѓРЎРЉР С”Р С•Р С–Р С•РЎРѓР С—Р С•Р Т‘Р В°РЎР‚РЎРѓРЎРЉР С”Р С•Р С–Р С•',
   'РЎРѓР В°Р Т‘РЎвЂ“Р Р†Р Р…Р С‘РЎвЂ РЎвЂљР Р†Р С•',
];

const ACTUALITY_GROUPS = [
   { value: 'active', label: 'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–' },
   { value: 'paused', label: 'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–' },
   { value: 'inactive', label: 'Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–' },
];

const ACTUALITY_STATUSES = [
   'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р С›Р С–Р В»РЎРЏР Р…РЎС“РЎвЂљР С‘Р в„–! Р вЂ™ РЎР‚Р С•Р В±Р С•РЎвЂљРЎвЂ“',
   'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р СџРЎР‚Р С•Р Т‘Р В·Р Р†РЎвЂ“Р Р…',
   'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р СџРЎР‚Р С•Р В±Р В»Р ВµР СР Р…Р С‘Р в„–',
   'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р С›Р С–Р В»РЎРЏР Р…РЎС“РЎвЂљР С‘Р в„–! Р СњР Вµ Р Р† РЎР‚Р С•Р В±Р С•РЎвЂљРЎвЂ“',
   'Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р В Р ВµР В°Р В»РЎвЂ“Р В·Р С•Р Р†Р В°Р Р…Р С‘Р в„– Р Р…Р Вµ Р СР Р…Р С•РЎР‹',
   'Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р вЂ”Р Р…РЎРЏРЎвЂљР С‘Р в„– Р В· РЎР‚Р ВµР В°Р В»РЎвЂ“Р В·Р В°РЎвЂ РЎвЂ“РЎвЂ”',
   'Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р СњР ВµР Р†РЎвЂ“Р Т‘Р С•Р СР В° Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В°',
   'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–. Р вЂ”Р В°Р Р†Р Т‘Р В°РЎвЂљР С•Р С” Р СРЎвЂ“Р в„–',
   'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–. Р вЂ”Р В°Р Р†Р Т‘Р В°РЎвЂљР С•Р С” Р Р…Р Вµ Р СРЎвЂ“Р в„–',
   'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–. Р вЂ™Р С‘РЎРЏР Р†Р В»Р ВµР Р…Р В° Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В° Р Р†Р В»Р В°РЎРѓР Р…Р С‘Р С”РЎвЂ“Р Р†',
   'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–. Р СњР ВµР Р†Р С‘РЎРЏР Р†Р В»Р ВµР Р…Р В° Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В° Р Р†Р В»Р В°РЎРѓР Р…Р С‘Р С”РЎвЂ“Р Р†',
];

const BUSINESS_SCORE_FIELDS = [
   { key: 'finance', label: 'Р СџРЎР‚Р С‘Р В±РЎС“РЎвЂљР С”Р С•Р Р†РЎвЂ“РЎРѓРЎвЂљРЎРЉ' },
   { key: 'liquidity', label: 'Р вЂєРЎвЂ“Р С”Р Р†РЎвЂ“Р Т‘Р Р…РЎвЂ“РЎРѓРЎвЂљРЎРЉ' },
   { key: 'loyalty', label: 'Р вЂєР С•РЎРЏР В»РЎРЉР Р…РЎвЂ“РЎРѓРЎвЂљРЎРЉ' },
   { key: 'motivation', label: 'Р СљР С•РЎвЂљР С‘Р Р†Р В°РЎвЂ РЎвЂ“РЎРЏ' },
   { key: 'problemFree', label: 'Р СњР ВµР С—РЎР‚Р С•Р В±Р В»Р ВµР СР Р…РЎвЂ“РЎРѓРЎвЂљРЎРЉ' },
   { key: 'adAttractiveness', label: 'Р В Р ВµР С”Р В»Р В°Р СР Р…Р В° Р С—РЎР‚Р С‘Р Р†Р В°Р В±Р В»Р С‘Р Р†РЎвЂ“РЎРѓРЎвЂљРЎРЉ' },
   { key: 'adHistory', label: 'Р вЂ РЎРѓРЎвЂљР С•РЎР‚РЎвЂ“РЎРЏ РЎР‚Р ВµР С”Р В»Р В°Р СР С‘' },
   { key: 'adStrategy', label: 'Р РЋРЎвЂљРЎР‚Р В°РЎвЂљР ВµР С–РЎвЂ“РЎРЏ РЎР‚Р ВµР С”Р В»Р В°Р СР С‘' },
];

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: '#fff',
      minHeight: 44,
      fontSize: '0.92rem',

      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         caretColor: '#fff',
         paddingTop: '10px',
         paddingBottom: '10px',
      },

      '& textarea': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         caretColor: '#fff',
      },

      '& .MuiSelect-select': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         paddingTop: '10px',
         paddingBottom: '10px',
         display: 'flex',
         alignItems: 'center',
         minHeight: 'auto',
      },

      '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.55)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },

   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.88) !important',
      fontWeight: 700,
      fontSize: '0.92rem',
   },

   '& .MuiInputLabel-root.Mui-focused': {
      color: 'rgba(200,160,255,1) !important',
      textShadow: '0 0 14px rgba(139,92,246,0.45)',
   },

   '& .MuiInputBase-input': {
      color: '#fff !important',
      WebkitTextFillColor: '#fff',
   },

   '& input::placeholder': {
      color: 'rgba(255,255,255,0.60) !important',
      opacity: 1,
   },

   '& textarea::placeholder': {
      color: 'rgba(255,255,255,0.60) !important',
      opacity: 1,
   },

   '& .MuiSelect-icon': {
      color: 'rgba(255,255,255,0.80) !important',
   },

   '& .MuiFormHelperText-root': {
      color: 'rgba(255,255,255,0.60)',
      fontSize: '0.78rem',
   },
};



const selectMenuProps = {
   PaperProps: {
      sx: {
         bgcolor: '#151521',
         color: '#fff',
         border: '1px solid rgba(255,255,255,0.08)',
         '& .MuiMenuItem-root': {
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.92rem',
         },
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: 'rgba(139,92,246,0.24)',
            color: '#fff',
         },
         '& .MuiMenuItem-root:hover': {
            bgcolor: 'rgba(255,255,255,0.06)',
         },
         '& .MuiSelect-select': {
            color: '#fff !important',
            WebkitTextFillColor: '#fff !important',
         }
      },
   },
};


function emptyOwner(isPrimary = false) {
   return {
      name: '',
      phones: [''],
      emails: [''],
      status: 'active',
      isPrimary,
      notes: '',
   };
}

function emptyRentOptions() {
   return {
      price: '',
      currency: 'USD',
      rentTitle: '',
      availableFrom: '',
      adText: '',
      notes: '',
      conditions: [''],
      furniture: [''],
      appliances: [''],
      lastActualizedAt: '',
      rentStory: {
         rentedAt: '',
         rentedByType: '',
         rentedByEmployee: '',
         rentedBy: '',
         note: '',
      },
      rentHistory: [],
   };
}

function emptyFields(type_estate = 'flat', type_deal = 'Р С—РЎР‚Р С•Р Т‘Р В°Р В¶') {
   return {
      type_estate,
      type_deal,
      ip: '',

      isPublic: false,
      actualityGroup: 'active',
      actualityStatus: 'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р СџРЎР‚Р С•Р Т‘Р В·Р Р†РЎвЂ“Р Р…',
      actualityNote: '',
      inactiveAt: '',
      inactiveNote: '',

      title: '',
      location_text: '',
      location: { city: '', street: '', number: '', flat: '' },

      rooms: '',
      square_tot: '',
      square_liv: '',
      square_kit: '',
      square_area: '',
      square_use: '',
      area_unit: '',

      floor: '',
      floors: '',

      type_building: '',
      type_walls: '',
      balconies: '',

      height_wall: '',
      type_using: '',
      type_commerce: '',

      type_house: '',
      purpose_area: '',

      cost: '',
      currency: 'USD',

      description: '',

      photoStage: 'draft',
      images: [],
      advantages: [],
      disadvantages: [],

      assignee: '',
      createdByEmployee: '',

      statusRent: 'rentNo',
      rentOptions: emptyRentOptions(),

      owners: [emptyOwner(true)],

      businessScore: {
         finance: '',
         liquidity: '',
         loyalty: '',
         motivation: '',
         problemFree: '',
         adAttractiveness: '',
         adHistory: '',
         adStrategy: '',
      },

      source: '',
      inspectedAt: '',
      originAction: {
         kind: '',
         occurredAt: '',
         sourceOperationEvent: '',
         note: '',
      },
      strategyApprovedBy: '',
      strategyApprovedAt: '',
   };
};

function normalizeFormData(data) {
   if (!data) return emptyFields('flat', 'Р С—РЎР‚Р С•Р Т‘Р В°Р В¶');

   return {
      ...emptyFields(data.type_estate || 'flat', data.type_deal || 'Р С—РЎР‚Р С•Р Т‘Р В°Р В¶'),
      ...data,
      location: {
         city: '',
         street: '',
         number: '',
         flat: '',
         ...(data.location || {}),
      },
      rentOptions: {
         ...emptyRentOptions(),
         ...(data.rentOptions || {}),
         rentStory: {
            rentedAt: '',
            rentedBy: '',
            note: '',
            ...(data.rentOptions?.rentStory || {}),
         },
      },
      owners: data.owners?.length ? data.owners : [emptyOwner(true)],
      advantages: data.advantages || [],
      disadvantages: data.disadvantages || [],
      images: data.images || [],
      assignee: data.assignee?._id || data.assignee || '',
      createdByEmployee:
         data.createdByEmployee?._id || data.createdByEmployee || '',

      businessScore: {
         finance: '',
         liquidity: '',
         loyalty: '',
         motivation: '',
         problemFree: '',
         adAttractiveness: '',
         adHistory: '',
         adStrategy: '',
         ...(data.businessScore || {}),
      },
      source: data.source || '',
      inactiveAt: data.inactiveAt ? String(data.inactiveAt).slice(0, 10) : '',
      inactiveNote: data.inactiveNote || '',
      inspectedAt: data.inspectedAt ? String(data.inspectedAt).slice(0, 10) : '',
      originAction: {
         kind: data.originAction?.kind || '',
         occurredAt: data.originAction?.occurredAt ? String(data.originAction.occurredAt).slice(0, 10) : '',
         sourceOperationEvent: data.originAction?.sourceOperationEvent?._id || data.originAction?.sourceOperationEvent || '',
         note: data.originAction?.note || '',
      },
      strategyApprovedBy: data.strategyApprovedBy?._id || data.strategyApprovedBy || '',
      strategyApprovedAt: data.strategyApprovedAt
         ? String(data.strategyApprovedAt).slice(0, 10)
         : '',


      images: (data.images || []).map((img, idx) => ({
         ...img,
         preview:
            img.preview ||
            img.url ||
            img.variants?.preview ||
            img.processedUrl ||
            img.brandedUrl ||
            '',
         isMain: !!img.isMain,
         stage: img.stage || 'draft',
         sortOrder: img.sortOrder ?? idx,
      })),
   };
}

export default function PropertyForm({
   onCancel,
   onSubmit,
   initialData = null,
   mode = 'create',
   employees = [],
   formMode = 'default',
}) {
   // const [fields, setFields] = useState(() => emptyFields('flat', 'Р С—РЎР‚Р С•Р Т‘Р В°Р В¶'));
   const isRentFormMode = formMode === 'rent';
   const [fields, setFields] = useState(() => {
      const normalized = normalizeFormData(initialData);

      if (!initialData && isRentFormMode) {
         return {
            ...normalized,
            type_deal: 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°',
            statusRent: 'rentActual',
         };
      }

      return normalized;
   });

   const [loading, setLoading] = useState(false);

   const [imgMeta, setImgMeta] = useState([]);
   const [imgWarn, setImgWarn] = useState('');
   const [imgProcessing, setImgProcessing] = useState(false);
   const [imgProcessingText, setImgProcessingText] = useState('');
   const [originShowings, setOriginShowings] = useState([]);
   const [originShowingsLoading, setOriginShowingsLoading] = useState(false);

   const type = fields.type_estate;

   const showRoomsBlock = type !== 'land';
   const showFlat = type === 'flat';
   const showHouse = type === 'house';
   const showLand = type === 'land';
   const showCommerce = type === 'commerce';

   const titleHint = useMemo(() => {
      if (type === 'flat') return 'Р СћР С‘РЎвЂљРЎС“Р В»РЎРЉР Р…Р В° Р Р…Р В°Р В·Р Р†Р В° Р С”Р Р†Р В°РЎР‚РЎвЂљР С‘РЎР‚Р С‘...';
      if (type === 'house') return 'Р СћР С‘РЎвЂљРЎС“Р В»РЎРЉР Р…Р В° Р Р…Р В°Р В·Р Р†Р В° Р В±РЎС“Р Т‘Р С‘Р Р…Р С”РЎС“...';
      if (type === 'land') return 'Р СћР С‘РЎвЂљРЎС“Р В»РЎРЉР Р…Р В° Р Р…Р В°Р В·Р Р†Р В° Р Т‘РЎвЂ“Р В»РЎРЏР Р…Р С”Р С‘...';
      if (type === 'commerce') return 'Р СћР С‘РЎвЂљРЎС“Р В»РЎРЉР Р…Р В° Р Р…Р В°Р В·Р Р†Р В° Р С”Р С•Р СР ВµРЎР‚РЎвЂ РЎвЂ“РЎвЂ”...';
      return "Р СћР С‘РЎвЂљРЎС“Р В»РЎРЉР Р…Р В° Р Р…Р В°Р В·Р Р†Р В° Р С•Р В±'РЎвЂќР С”РЎвЂљРЎС“...";
   }, [type]);


   const showSaleOptions = !isRentFormMode;
   const isRentObject = isRentFormMode || fields.statusRent !== 'rentNo';

   const toggleRentObject = () => {
      if (isRentFormMode) return;

      setFields((p) => ({
         ...p,
         statusRent: p.statusRent === 'rentNo' ? 'rentActual' : 'rentNo',
      }));
   };


   const setRentOptions = (nextRentOptions) => {
      setFields((p) => ({
         ...p,
         rentOptions: nextRentOptions,
      }));
   };

   const setOwners = (nextOwners) => {
      setFields((p) => ({
         ...p,
         owners: nextOwners,
      }));
   };


   const handleTypeChange = (_e, next) => {
      if (!next) return;

      setFields((p) => {
         const fresh = emptyFields(next, p.type_deal);

         return {
            ...fresh,
            type_estate: next,
            type_deal: p.type_deal,

            statusRent:
               p.type_deal === 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°'
                  ? (p.statusRent === 'rentNo' ? 'rentActual' : p.statusRent)
                  : p.statusRent,

            rentOptions: p.rentOptions || emptyRentOptions(),
            owners: p.owners?.length ? p.owners : [emptyOwner(true)],

            isPublic: p.isPublic,
            actualityGroup: p.actualityGroup,
            actualityStatus: p.actualityStatus,
            actualityNote: p.actualityNote,
            inactiveAt: p.inactiveAt,
            inactiveNote: p.inactiveNote,
            inspectedAt: p.inspectedAt,
            originAction: p.originAction,

            title: p.title,
            location_text: p.location_text,
            location: p.location,

            cost: p.cost,
            currency: p.currency,
            description: p.description,

            images: p.images || [],
            advantages: p.advantages || [],
            disadvantages: p.disadvantages || [],

            assignee: p.assignee,
            createdByEmployee: p.createdByEmployee,
         };
      });
   };

   const handleDealChange = (_e, next) => {
      if (!next) return;

      setFields((p) => {
         const nextFields = { ...p, type_deal: next };

         if (next === 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°' && p.statusRent === 'rentNo') {
            nextFields.statusRent = 'rentActual';
         }

         return nextFields;
      });
   };

   const getPhotoStageLabel = (stage) => {
      if (stage === 'draft') return 'Р В§Р С•РЎР‚Р Р…Р С•Р Р†РЎвЂ“';
      if (stage === 'processed') return 'Р С›Р В±РЎР‚Р С•Р В±Р В»Р ВµР Р…РЎвЂ“';
      if (stage === 'branded') return 'Р вЂ” Р В»Р С•Р С–Р С•';
      return stage || '';
   };

   const set = (name, value) =>
      setFields((p) => {
         if (name === 'actualityGroup') {
            const next = { ...p, actualityGroup: value };
            if (value === 'inactive' && !next.inactiveAt) {
               next.inactiveAt = new Date().toISOString().slice(0, 10);
            }
            if (
               value === 'inactive' &&
               (
                  !String(next.actualityStatus || '').startsWith('Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–.') ||
                  String(next.actualityStatus || '').includes('Р В Р ВµР В°Р В»РЎвЂ“Р В·Р С•Р Р†Р В°Р Р…Р С‘Р в„– Р СР Р…Р С•РЎР‹')
               )
            ) {
               next.actualityStatus = 'Р СњР ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р В Р ВµР В°Р В»РЎвЂ“Р В·Р С•Р Р†Р В°Р Р…Р С‘Р в„– Р Р…Р Вµ Р СР Р…Р С•РЎР‹';
            }
            if (value === 'active' && !String(next.actualityStatus || '').startsWith('Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–.')) {
               next.actualityStatus = 'Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С‘Р в„–. Р СџРЎР‚Р С•Р Т‘Р В·Р Р†РЎвЂ“Р Р…';
            }
            if (value === 'paused' && !String(next.actualityStatus || '').startsWith('Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–.')) {
               next.actualityStatus = 'Р вЂ”РЎС“Р С—Р С‘Р Р…Р ВµР Р…Р С‘Р в„–. Р СњР ВµР Р†Р С‘РЎРЏР Р†Р В»Р ВµР Р…Р В° Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В° Р Р†Р В»Р В°РЎРѓР Р…Р С‘Р С”РЎвЂ“Р Р†';
            }
            if (value !== 'inactive') {
               next.inactiveAt = '';
               next.inactiveNote = '';
            }
            return next;
         }

         return { ...p, [name]: value };
      });

   const setOriginAction = (key, value) =>
      setFields((p) => {
         const nextOrigin = { ...(p.originAction || {}), [key]: value };
         if (key === 'kind') {
            nextOrigin.sourceOperationEvent = '';
            if (value === 'review' && nextOrigin.occurredAt) {
               return { ...p, originAction: nextOrigin, inspectedAt: p.inspectedAt || nextOrigin.occurredAt };
            }
         }
         if (key === 'occurredAt') {
            nextOrigin.sourceOperationEvent = '';
            return {
               ...p,
               originAction: nextOrigin,
               inspectedAt: (p.originAction?.kind === 'review' || nextOrigin.kind === 'review') ? value : p.inspectedAt,
            };
         }
         return { ...p, originAction: nextOrigin };
      });

   const setLoc = (key, value) =>
      setFields((p) => ({ ...p, location: { ...p.location, [key]: value } }));

   const employeeLabel = (employee) => {
      if (!employee) return '';
      if (typeof employee === 'string') return '';
      return [employee.surname, employee.name].filter(Boolean).join(' ') || employee.fullName || employee.email || '';
   };

   const showingOptionLabel = (item) => {
      if (!item) return '';
      const property = item.property?.title || item.property?.location_text || 'Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ Р В±Р ВµР В· Р Р…Р В°Р В·Р Р†Р С‘';
      const lead = item.lead?.name || 'Р В±Р ВµР В· Р С—Р С•Р С”РЎС“Р С—РЎвЂ РЎРЏ';
      const responsible = employeeLabel(item.responsibleEmployee);
      const date = item.occurredAt
         ? new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.occurredAt))
         : '';
      return [property, date, lead, responsible].filter(Boolean).join(' Р’В· ');
   };

   const showingOptionMeta = (item) => {
      if (!item) return '';
      const lead = item.lead?.name || 'Р В±Р ВµР В· Р С—Р С•Р С”РЎС“Р С—РЎвЂ РЎРЏ';
      const responsible = employeeLabel(item.responsibleEmployee) || 'Р Р†РЎвЂ“Р Т‘Р С—Р С•Р Р†РЎвЂ“Р Т‘Р В°Р В»РЎРЉР Р…Р С‘Р в„– РІР‚вЂќ';
      const date = item.occurredAt
         ? new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.occurredAt))
         : 'Р Т‘Р В°РЎвЂљР В° РІР‚вЂќ';
      return `${date} Р’В· ${lead} Р’В· ${responsible}`;
   };

   useEffect(() => {
      const kind = fields.originAction?.kind || '';
      const date = fields.originAction?.occurredAt || '';
      if (kind !== 'showing' || !date) {
         setOriginShowings([]);
         return;
      }

      const controller = new AbortController();
      const load = async () => {
         try {
            setOriginShowingsLoading(true);
            const from = new Date(`${date}T00:00:00`);
            const to = new Date(from);
            to.setDate(to.getDate() + 1);
            const params = new URLSearchParams();
            params.set('type', 'showing');
            params.set('pageSize', '20');
            params.set('occurredFrom', from.toISOString());
            params.set('occurredTo', to.toISOString());
            const res = await fetch(`/api/crm/operations?${params.toString()}`, { cache: 'no-store', signal: controller.signal });
            const data = res.ok ? await res.json() : { items: [] };
            setOriginShowings(Array.isArray(data?.items) ? data.items : []);
         } catch (error) {
            if (error?.name !== 'AbortError') {
               console.error(error);
               setOriginShowings([]);
            }
         } finally {
            if (!controller.signal.aborted) setOriginShowingsLoading(false);
         }
      };

      load();
      return () => controller.abort();
   }, [fields.originAction?.kind, fields.originAction?.occurredAt]);


   const setMainImage = (index) => {
      setFields((p) => ({
         ...p,
         images: (p.images || []).map((img, i) => ({
            ...img,
            isMain: i === index,
         })),
      }));
   };

   const removeImage = (index) => {
      setFields((p) => {
         const target = p.images?.[index];
         if (target?.preview) {
            try {
               URL.revokeObjectURL(target.preview);
            } catch (_e) { }
         }

         const next = (p.images || []).filter((_, i) => i !== index);

         if (next.length > 0 && !next.some((img) => img.isMain)) {
            next[0] = { ...next[0], isMain: true };
         }

         return { ...p, images: next };
      });
   };



   const setAdv = (idx, value) =>
      setFields((p) => {
         const arr = [...p.advantages];
         arr[idx] = value;
         return { ...p, advantages: arr };
      });

   const setDisadv = (idx, value) =>
      setFields((p) => {
         const arr = [...p.disadvantages];
         arr[idx] = value;
         return { ...p, disadvantages: arr };
      });

   const MAX_BYTES = SAFE_IMAGE_FILE_BYTES;
   const MAX_FILES = 25;
   const formatBytes = formatImageBytes;

   const handleImages = async (e) => {
      const picked = Array.from(e.target.files || []);

      setImgWarn('');
      setImgMeta([]);

      if (!picked.length) return;

      e.target.value = '';

      const existing = fields.images || [];
      const availableSlots = MAX_FILES - existing.length;

      if (availableSlots <= 0) {
         setImgWarn(`РњР°РєСЃРёРјСѓРј ${MAX_FILES} С„РѕС‚Рѕ.`);
         return;
      }

      const filesToProcess = picked.slice(0, availableSlots);
      const existingUploadBytes = existing.reduce((sum, img) => sum + (img?.file?.size || 0), 0);

      setImgProcessing(true);
      setImgProcessingText(`РџС–РґРіРѕС‚РѕРІРєР° С„РѕС‚Рѕ: 0 / ${filesToProcess.length}`);

      try {
         const prepared = await prepareImageUploadFiles(filesToProcess, {
            initialPayloadBytes: existingUploadBytes,
            onProgress: (index, file) => {
               setImgProcessingText(
                  `${isHeicFile(file) ? 'РљРѕРЅРІРµСЂС‚Р°С†С–СЏ HEIC' : 'РЎС‚РёСЃРєР°РЅРЅСЏ С„РѕС‚Рѕ'}: ${index + 1} / ${filesToProcess.length}`
               );
            },
         });

         const nextImages = prepared.accepted.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isMain: false,
            stage: fields.photoStage || 'draft',
         }));

         let merged = [...existing, ...nextImages];

         if (merged.length > 0 && !merged.some((img) => img.isMain)) {
            merged = merged.map((img, idx) => ({
               ...img,
               isMain: idx === 0,
            }));
         }

         setImgMeta(prepared.meta);

         if (prepared.skipped.length) {
            setImgWarn(
               `Р§Р°СЃС‚РёРЅР° С„РѕС‚Рѕ РЅРµ РґРѕРґР°РЅР°, Р±Рѕ Р±РµР·РїРµС‡РЅРёР№ Р»С–РјС–С‚ РѕРґРЅРѕРіРѕ Р·Р±РµСЂРµР¶РµРЅРЅСЏ ${formatBytes(SAFE_IMAGE_PAYLOAD_BYTES)}. Р”РѕРґР°Р№ С—С… РЅР°СЃС‚СѓРїРЅРѕСЋ РїР°СЂС‚С–С”СЋ: ${prepared.skipped.join(', ')}`
            );
         }

         if (prepared.failed.length) {
            setImgWarn((prev) =>
               prev
                  ? `${prev} РўР°РєРѕР¶ РЅРµ РІРґР°Р»РѕСЃСЏ РѕР±СЂРѕР±РёС‚Рё С– РґРѕРґР°С‚Рё: ${prepared.failed.join(', ')}.`
                  : `РќРµ РІРґР°Р»РѕСЃСЏ РѕР±СЂРѕР±РёС‚Рё С– РґРѕРґР°С‚Рё: ${prepared.failed.join(', ')}.`
            );
         }

         if (picked.length > filesToProcess.length) {
            setImgWarn((prev) =>
               prev
                  ? `${prev} РўР°РєРѕР¶ С‡Р°СЃС‚РёРЅР° С„РѕС‚Рѕ РЅРµ РґРѕРґР°РЅР°, Р±Рѕ Р»С–РјС–С‚ ${MAX_FILES}.`
                  : `Р§Р°СЃС‚РёРЅР° С„РѕС‚Рѕ РЅРµ РґРѕРґР°РЅР°, Р±Рѕ Р»С–РјС–С‚ ${MAX_FILES}.`
            );
         }

         set('images', merged);
      } finally {
         setImgProcessing(false);
         setImgProcessingText('');
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         // const normalizedStatusRent =
         //    fields.type_deal === 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°' && fields.statusRent === 'rentNo'
         //       ? 'rentActual'
         //       : fields.statusRent;

         const payload = {
            ...fields,
            type_deal: isRentFormMode ? 'Р С•РЎР‚Р ВµР Р…Р Т‘Р В°' : fields.type_deal,
            originAction: isRentFormMode ? {} : fields.originAction,
            rooms: fields.rooms ? Number(fields.rooms) : undefined,
            square_tot: fields.square_tot ? Number(fields.square_tot) : undefined,
            square_liv: fields.square_liv ? Number(fields.square_liv) : undefined,
            square_kit: fields.square_kit ? Number(fields.square_kit) : undefined,
            square_area: fields.square_area ? Number(fields.square_area) : undefined,
            square_use: fields.square_use ? Number(fields.square_use) : undefined,
            floor: fields.floor ? Number(fields.floor) : undefined,
            floors: fields.floors ? Number(fields.floors) : undefined,
            balconies: fields.balconies ? Number(fields.balconies) : undefined,
            height_wall: fields.height_wall ? Number(fields.height_wall) : undefined,
            cost: fields.cost ? Number(fields.cost) : undefined,

            assignee: fields.assignee || '',
            advantages: (fields.advantages || []).map((x) => x?.trim()).filter(Boolean),
            disadvantages: (fields.disadvantages || []).map((x) => x?.trim()).filter(Boolean),

            title: isRentFormMode ? initialData?.title || fields.title || '' : fields.title?.trim(),
            location_text: fields.location_text?.trim(),
            description: fields.description?.trim(),
            actualityNote: fields.actualityNote?.trim(),
            inactiveAt: fields.actualityGroup === 'inactive' ? fields.inactiveAt || '' : '',
            inactiveNote: fields.actualityGroup === 'inactive' ? fields.inactiveNote?.trim() || '' : '',

            statusRent: isRentFormMode && fields.statusRent === 'rentNo' ? 'rentActual' : fields.statusRent,

            owners: (fields.owners || [])
               .map((owner) => ({
                  ...owner,
                  name: owner.name?.trim() || '',
                  phones: (owner.phones || []).map((x) => x?.trim()).filter(Boolean),
                  emails: (owner.emails || []).map((x) => x?.trim()).filter(Boolean),
                  notes: owner.notes?.trim() || '',
               }))
               .filter((owner) => owner.name || owner.phones?.length || owner.emails?.length || owner.notes),

            rentOptions:
               fields.statusRent === 'rentNo'
                  ? emptyRentOptions()
                  : {
                     ...fields.rentOptions,
                     price: fields.rentOptions?.price ? Number(fields.rentOptions.price) : undefined,
                     adText: fields.rentOptions?.adText?.trim() || '',
                     rentTitle: fields.rentOptions?.rentTitle?.trim() || '',
                     notes: fields.rentOptions?.notes?.trim() || '',
                     conditions: (fields.rentOptions?.conditions || []).map((x) => x?.trim()).filter(Boolean),
                     furniture: (fields.rentOptions?.furniture || []).map((x) => x?.trim()).filter(Boolean),
                     appliances: (fields.rentOptions?.appliances || []).map((x) => x?.trim()).filter(Boolean),
                     rentStory: {
                        rentedAt: fields.rentOptions?.rentStory?.rentedAt || '',
                        rentedByType: fields.rentOptions?.rentStory?.rentedByType || '',
                        rentedByEmployee: fields.rentOptions?.rentStory?.rentedByEmployee || '',
                        rentedBy: fields.rentOptions?.rentStory?.rentedBy || '',
                        note: fields.rentOptions?.rentStory?.note?.trim() || '',
                     },
                     rentHistory: Array.isArray(fields.rentOptions?.rentHistory)
                        ? fields.rentOptions.rentHistory
                        : [],
                  },

            source: isRentFormMode ? '' : fields.source?.trim() || '',
            inspectedAt: isRentFormMode ? '' : fields.inspectedAt || '',
            originAction: isRentFormMode
               ? {}
               : {
                  kind: fields.originAction?.kind || '',
                  occurredAt: fields.originAction?.occurredAt || '',
                  sourceOperationEvent: fields.originAction?.kind === 'showing' ? fields.originAction?.sourceOperationEvent || '' : '',
                  note: fields.originAction?.note?.trim() || '',
               },
            strategyApprovedBy: isRentFormMode ? '' : fields.strategyApprovedBy || '',
            strategyApprovedAt: isRentFormMode ? '' : fields.strategyApprovedAt || '',

            businessScore: isRentFormMode
               ? {}
               : {
                  finance: fields.businessScore?.finance ? Number(fields.businessScore.finance) : undefined,
                  liquidity: fields.businessScore?.liquidity ? Number(fields.businessScore.liquidity) : undefined,
                  loyalty: fields.businessScore?.loyalty ? Number(fields.businessScore.loyalty) : undefined,
                  motivation: fields.businessScore?.motivation ? Number(fields.businessScore.motivation) : undefined,
                  problemFree: fields.businessScore?.problemFree ? Number(fields.businessScore.problemFree) : undefined,
                  adAttractiveness: fields.businessScore?.adAttractiveness ? Number(fields.businessScore.adAttractiveness) : undefined,
                  adHistory: fields.businessScore?.adHistory ? Number(fields.businessScore.adHistory) : undefined,
                  adStrategy: fields.businessScore?.adStrategy ? Number(fields.businessScore.adStrategy) : undefined,
               },

            images: fields.images || [],
         };

         console.log('CREATE PROPERTY payload:', payload);

         const stillTooBig = (fields.images || []).some((img) => img?.file?.size > MAX_BYTES);
         const uploadBytes = (fields.images || []).reduce((sum, img) => sum + (img?.file?.size || 0), 0);

         if (stillTooBig) {
            alert(`Є фото більше ${formatBytes(MAX_BYTES)}. Прибери або додай його окремо.`);
            setLoading(false);
            return;
         }

         if (uploadBytes > SAFE_IMAGE_PAYLOAD_BYTES) {
            alert(`Забагато фото для одного збереження (${formatBytes(uploadBytes)}). Збережи меншу партію, а решту додай через галерею.`);
            setLoading(false);
            return;
         }
         if (fields.actualityGroup === 'inactive' && !fields.inactiveAt) {
            alert('Р вЂ™Р С”Р В°Р В¶Р С‘ Р Т‘Р В°РЎвЂљРЎС“ Р Р…Р ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“');
            setLoading(false);
            return;
         }

         if (fields.actualityGroup === 'inactive' && !fields.inactiveNote?.trim()) {
            alert('Р вЂ™Р С”Р В°Р В¶Р С‘ Р Р…Р С•РЎвЂљР В°РЎвЂљР С”РЎС“ Р Р…Р ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“');
            setLoading(false);
            return;
         }

         console.log('FIELDS BEFORE SUBMIT');
         console.log(fields);


         await onSubmit?.(payload);
      } finally {
         setLoading(false);
      }
   };


   useEffect(() => {
      // if (initialData) {
      setFields(normalizeFormData(initialData));
      // }
   }, []); //initialData

   const originActionBlock = (
      <Box
         sx={{
            p: 1.4,
            mb: 2,
            borderRadius: 3,
            border: '1px solid rgba(45,212,191,0.28)',
            bgcolor: 'rgba(20,184,166,0.07)',
         }}
      >
         <Stack spacing={1.1}>
            <Stack spacing={0.15}>
               <Typography sx={{ color: '#fff', fontWeight: 950 }}>
                  Р С›Р С–Р В»РЎРЏР Т‘
               </Typography>
               <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 12.5 }}>
                  Р вЂ”Р В°РЎвЂћРЎвЂ“Р С”РЎРѓРЎС“Р в„–, Р В·Р Р†РЎвЂ“Р Т‘Р С”Р С‘ Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ Р С—Р С•РЎвЂљРЎР‚Р В°Р С—Р С‘Р Р† РЎС“ РЎР‚Р С•Р В±Р С•РЎвЂљРЎС“: Р С—РЎвЂ“РЎРѓР В»РЎРЏ Р С•Р С–Р В»РЎРЏР Т‘РЎС“ Р В°Р В±Р С• РЎРЏР С” Р Р…Р В°РЎРѓР В»РЎвЂ“Р Т‘Р С•Р С” Р С—Р С•Р С”Р В°Р В·РЎС“.
               </Typography>
            </Stack>

            <Grid container spacing={1}>
               <Grid item xs={12} md={3}>
                  <TextField
                     select
                     fullWidth
                     label="Р вЂ™Р С‘Р Т‘ Р С•Р С–Р В»РЎРЏР Т‘РЎС“"
                     value={fields.originAction?.kind || ''}
                     onChange={(e) => setOriginAction('kind', e.target.value)}
                     sx={fieldSx}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {ORIGIN_ACTION_OPTIONS.map((x) => (
                        <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                     ))}
                  </TextField>
               </Grid>

               <Grid item xs={12} md={3}>
                  <TextField
                     fullWidth
                     type="date"
                     label={fields.originAction?.kind === 'showing' ? 'Р вЂќР В°РЎвЂљР В° Р С—Р С•Р С”Р В°Р В·РЎС“' : 'Р вЂќР В°РЎвЂљР В° Р С•Р С–Р В»РЎРЏР Т‘РЎС“'}
                     value={fields.originAction?.occurredAt || ''}
                     onChange={(e) => setOriginAction('occurredAt', e.target.value)}
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                     disabled={!fields.originAction?.kind}
                  />
               </Grid>

               {fields.originAction?.kind === 'showing' && (
                  <Grid item xs={12} md={6}>
                     <TextField
                        select
                        fullWidth
                        label="Р СџР С•Р Р†РІР‚в„ўРЎРЏР В·Р В°Р Р…Р С‘Р в„– Р С—Р С•Р С”Р В°Р В·"
                        value={fields.originAction?.sourceOperationEvent || ''}
                        onChange={(e) => setOriginAction('sourceOperationEvent', e.target.value)}
                        sx={fieldSx}
                        SelectProps={{
                           MenuProps: selectMenuProps,
                           renderValue: (value) => {
                              const selected = originShowings.find((item) => item._id === value);
                              return selected ? showingOptionLabel(selected) : 'РІР‚вЂќ';
                           },
                        }}
                        disabled={!fields.originAction?.occurredAt || originShowingsLoading}
                        helperText={
                           !fields.originAction?.occurredAt
                              ? 'Р РЋР С—Р С•РЎвЂЎР В°РЎвЂљР С”РЎС“ Р Р†Р С‘Р В±Р ВµРЎР‚Р С‘ Р Т‘Р В°РЎвЂљРЎС“ РІР‚вЂќ РЎвЂљР С•Р Т‘РЎвЂ“ Р С—РЎвЂ“Р Т‘РЎвЂљРЎРЏР С–Р Р…Р ВµР СР С• Р С—Р С•Р С”Р В°Р В·Р С‘ РЎвЂ РЎРЉР С•Р С–Р С• Р Т‘Р Р…РЎРЏ'
                              : originShowingsLoading
                                 ? 'Р вЂ”Р В°Р Р†Р В°Р Р…РЎвЂљР В°Р В¶РЎС“РЎР‹ Р С—Р С•Р С”Р В°Р В·Р С‘...'
                                 : originShowings.length
                                    ? 'Р С›Р В±Р ВµРЎР‚Р С‘ Р С—Р С•Р С”Р В°Р В·, Р С—РЎвЂ“Р Т‘ РЎвЂЎР В°РЎРѓ РЎРЏР С”Р С•Р С–Р С• Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ Р Р†Р В·РЎРЏР В»Р С‘ Р Р† РЎР‚Р С•Р В±Р С•РЎвЂљРЎС“'
                                    : 'Р СњР В° РЎвЂ РЎР‹ Р Т‘Р В°РЎвЂљРЎС“ Р С—Р С•Р С”Р В°Р В·РЎвЂ“Р Р† Р Р…Р Вµ Р В·Р Р…Р В°Р в„–Р Т‘Р ВµР Р…Р С•'
                        }
                     >
                        <MenuItem value="">РІР‚вЂќ</MenuItem>
                        {originShowings.map((item) => (
                           <MenuItem key={item._id} value={item._id} sx={{ alignItems: 'flex-start', py: 0.9 }}>
                              <Stack spacing={0.15} sx={{ minWidth: 0, maxWidth: 640 }}>
                                 <Typography sx={{ color: '#fff', fontWeight: 950, fontSize: 15, lineHeight: 1.16 }} noWrap>
                                    {item.property?.title || item.property?.location_text || 'Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ Р В±Р ВµР В· Р Р…Р В°Р В·Р Р†Р С‘'}
                                 </Typography>
                                 <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: 12.5, lineHeight: 1.2 }} noWrap>
                                    {showingOptionMeta(item)}
                                 </Typography>
                              </Stack>
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               )}

               <Grid item xs={12} md={fields.originAction?.kind === 'showing' ? 12 : 6}>
                  <TextField
                     fullWidth
                     label="Р С™Р С•Р СР ВµР Р…РЎвЂљР В°РЎР‚ Р Т‘Р С• Р С•Р С–Р В»РЎРЏР Т‘РЎС“"
                     placeholder={fields.originAction?.kind === 'showing' ? 'Р СњР В°Р С—РЎР‚Р С‘Р С”Р В»Р В°Р Т‘: Р С—РЎвЂ“Р Т‘ РЎвЂЎР В°РЎРѓ Р С—Р С•Р С”Р В°Р В·РЎС“ Р С—Р С•Р В±Р В°РЎвЂЎР С‘Р В»Р С‘ РЎРѓРЎС“РЎРѓРЎвЂ“Р Т‘Р Р…РЎвЂ“Р в„– Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ РЎвЂ“ Р Т‘Р С•Р СР С•Р Р†Р С‘Р В»Р С‘РЎРѓРЎРЉ Р Р†Р В·РЎРЏРЎвЂљР С‘ Р Р† РЎР‚Р С•Р В±Р С•РЎвЂљРЎС“' : 'Р СњР В°Р С—РЎР‚Р С‘Р С”Р В»Р В°Р Т‘: Р С•Р С–Р В»РЎРЏР Т‘ Р С—РЎР‚Р С•Р Р†Р ВµР Т‘Р ВµР Р…Р С•, Р Р†Р В»Р В°РЎРѓР Р…Р С‘Р С” Р С—Р С•Р С–Р С•Р Т‘Р С‘Р Р† Р С—РЎР‚Р В°Р Р†Р С‘Р В»Р В° РЎР‚Р С•Р В±Р С•РЎвЂљР С‘'}
                     value={fields.originAction?.note || ''}
                     onChange={(e) => setOriginAction('note', e.target.value)}
                     sx={fieldSx}
                     disabled={!fields.originAction?.kind}
                  />
               </Grid>
            </Grid>
         </Stack>
      </Box>
   );

   return (
      <Box component="form" onSubmit={handleSubmit}>
         {showSaleOptions && (
         <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
         >
            <Stack spacing={1}>
               {/* <Typography
                  sx={{
                     color: '#fff',
                     fontWeight: 950,
                     fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
               >
                  Р вЂќР С•Р Т‘Р В°РЎвЂљР С‘ Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ
               </Typography> */}

               <Button
                  onClick={toggleRentObject}
                  sx={{
                     alignSelf: 'flex-start',
                     borderRadius: 999,
                     px: 1.5,
                     py: 0.7,
                     fontWeight: 900,
                     color: '#fff',
                     border: isRentObject
                        ? '1px solid rgba(34,197,94,0.32)'
                        : '1px solid rgba(255,255,255,0.12)',
                     bgcolor: isRentObject
                        ? 'rgba(34,197,94,0.14)'
                        : 'rgba(255,255,255,0.04)',
                     '&:hover': {
                        bgcolor: isRentObject
                           ? 'rgba(34,197,94,0.20)'
                           : 'rgba(255,255,255,0.08)',
                     },
                  }}
               >
                  {isRentObject
                     ? "Р Р‡Р Р†Р В»РЎРЏРЎвЂќРЎвЂљРЎРЉРЎРѓРЎРЏ Р С•Р В±'РЎвЂќР С”РЎвЂљР С•Р С Р С•РЎР‚Р ВµР Р…Р Т‘Р С‘"
                     : "Р СњР вЂў РЎРЏР Р†Р В»РЎРЏРЎвЂќРЎвЂљРЎРЉРЎРѓРЎРЏ Р С•Р В±'РЎвЂќР С”РЎвЂљР С•Р С Р С•РЎР‚Р ВµР Р…Р Т‘Р С‘"}
               </Button>
            </Stack>

            <ToggleButtonGroup
               exclusive
               value={fields.type_deal}
               onChange={handleDealChange}
               sx={{
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  p: 0.5,
                  gap: 0.7,
                  '& .MuiToggleButton-root': {
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 2.5,
                     color: 'rgba(255,255,255,0.78)',
                     textTransform: 'none',
                     fontWeight: 900,
                     fontSize: '0.85rem',
                     px: 2,
                     py: 0.8,
                     '&.Mui-selected': {
                        color: '#fff',
                        borderColor: 'rgba(139,92,246,0.65)',
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.18))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.22)',
                     },
                  },
               }}
            >
               {DEAL_TYPES.map((t) => (
                  <ToggleButton key={t.value} value={t.value}>
                     {t.label}
                  </ToggleButton>
               ))}
            </ToggleButtonGroup>
         </Stack>
         )}

         <Stack spacing={1.2} sx={{ mb: 2 }}>
            <ToggleButtonGroup
               exclusive
               value={fields.type_estate}
               onChange={handleTypeChange}
               sx={{
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  p: 0.6,
                  gap: 0.8,
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 2.5,
                     color: 'rgba(255,255,255,0.78)',
                     textTransform: 'none',
                     fontWeight: 850,
                     fontSize: '0.9rem',
                     px: 1.8,
                     py: 0.85,
                     '&.Mui-selected': {
                        color: '#fff',
                        borderColor: 'rgba(139,92,246,0.65)',
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.18))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.22)',
                     },
                  },
               }}
            >
               {ESTATE_TYPES.map((t) => (
                  <ToggleButton key={t.value} value={t.value}>
                     {t.label}
                  </ToggleButton>
               ))}
            </ToggleButtonGroup>
         </Stack>

         <Grid container spacing={1.6} sx={{ mb: 2 }}>
            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Р ТђР В°РЎР‚Р В°Р С”РЎвЂљР ВµРЎР‚Р С‘РЎРѓРЎвЂљР С‘Р С”Р С‘ РЎР‚Р С•Р В±Р С•РЎвЂЎРЎвЂ“
               </Typography>
            </Grid>

            {showSaleOptions && (
               <>
                  <Grid item xs={12} md={3}>
                     <TextField
                        select
                        label="Р С’Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…РЎвЂ“РЎРѓРЎвЂљРЎРЉ Р С—РЎР‚Р С•Р Т‘Р В°Р В¶РЎС“"
                        value={fields.actualityGroup}
                        onChange={(e) => set('actualityGroup', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {ACTUALITY_GROUPS.map((x) => (
                           <MenuItem key={x.value} value={x.value}>
                              {x.label}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={5}>
                     <TextField
                        select
                        label="Р СџР С•РЎРЏРЎРѓР Р…Р ВµР Р…Р Р…РЎРЏ Р В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“"
                        value={fields.actualityStatus}
                        onChange={(e) => set('actualityStatus', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {ACTUALITY_STATUSES.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            <Grid item xs={12} md={6}>
               <TextField
                  select
                  label="Р СџРЎС“Р В±Р В»РЎвЂ“Р С”Р В°РЎвЂ РЎвЂ“РЎРЏ Р Р…Р В° РЎРѓР В°Р в„–РЎвЂљРЎвЂ“"
                  value={String(fields.isPublic)}
                  onChange={(e) => set('isPublic', e.target.value === 'true')}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  <MenuItem value="true">Р СћР В°Р С”, Р С—РЎС“Р В±Р В»РЎвЂ“РЎвЂЎР Р…Р С‘Р в„–</MenuItem>
                  <MenuItem value="false">Р СњРЎвЂ“, Р В»Р С‘РЎв‚¬Р Вµ CRM</MenuItem>
               </TextField>
            </Grid>

            {showSaleOptions && fields.actualityGroup === 'inactive' && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        type="date"
                        label="Р вЂќР В°РЎвЂљР В° Р Р…Р ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“"
                        value={fields.inactiveAt || ''}
                        onChange={(e) => set('inactiveAt', e.target.value)}
                        fullWidth
                        required
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>

                  <Grid item xs={12} md={8}>
                     <TextField
                        label="Р СњР С•РЎвЂљР В°РЎвЂљР С”Р В° Р Р…Р ВµР В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“"
                        placeholder="Р В©Р С• РЎРѓРЎвЂљР В°Р В»Р С•РЎРѓРЎРЏ: Р С—РЎР‚Р С•Р Т‘Р В°Р Р…Р С• Р Р…Р Вµ Р Р…Р В°Р СР С‘, Р В·Р Р…РЎРЏР Р† Р Р†Р В»Р В°РЎРѓР Р…Р С‘Р С”, Р С—Р ВµРЎР‚Р ВµР Т‘РЎС“Р СР В°Р В»Р С‘, РЎвЂ“Р Р…РЎв‚¬Р В° Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В°..."
                        value={fields.inactiveNote || ''}
                        onChange={(e) => set('inactiveNote', e.target.value)}
                        fullWidth
                        required
                        multiline
                        minRows={1}
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            <Grid item xs={12} md={6}>
               <TextField
                  select
                  label="Р вЂ™РЎвЂ“Р Т‘Р С—Р С•Р Р†РЎвЂ“Р Т‘Р В°Р В»РЎРЉР Р…Р С‘Р в„–"
                  value={fields.assignee}
                  onChange={(e) => set('assignee', e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  <MenuItem value="">Р СњР Вµ Р С—РЎР‚Р С‘Р В·Р Р…Р В°РЎвЂЎР ВµР Р…Р С•</MenuItem>
                  {employees.map((emp) => (
                     <MenuItem key={emp._id} value={emp._id}>
                        {emp.fullName || [emp.surname, emp.name].filter(Boolean).join(' ') || emp.name}
                     </MenuItem>
                  ))}
               </TextField>
            </Grid>

            {showSaleOptions && (
               <>
                  <Grid item xs={12}>
                     <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                        Р вЂРЎвЂ“Р В·Р Р…Р ВµРЎРѓ-Р С•РЎвЂ РЎвЂ“Р Р…Р С”Р В°
                     </Typography>
                  </Grid>

                  {BUSINESS_SCORE_FIELDS.map((field) => (
                     <Grid item xs={12} sm={6} md={3} key={field.key}>
                        <TextField
                           select
                           label={BUSINESS_SCORE_OPTIONS[field.key].label}
                           value={fields.businessScore?.[field.key] || ''}
                           onChange={(e) =>
                              setFields((p) => ({
                                 ...p,
                                 businessScore: {
                                    ...(p.businessScore || {}),
                                    [field.key]: e.target.value,
                                 },
                              }))
                           }
                           fullWidth
                           sx={fieldSx}
                        >
                           <MenuItem value="">РІР‚вЂќ</MenuItem>
                           {[5, 4, 3, 2, 1].map((n) => (
                              <MenuItem key={n} value={n}>
                                 {n} РІР‚вЂќ {BUSINESS_SCORE_OPTIONS[field.key].options[n]}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>
                  ))}

                  <Grid item xs={12} md={4}>
                     <TextField
                        label="Р вЂќР В¶Р ВµРЎР‚Р ВµР В»Р С•"
                        value={fields.source || ''}
                        onChange={(e) => set('source', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р ТђРЎвЂљР С• Р С—Р С•Р С–Р С•Р Т‘Р С‘Р Р† РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР ВµР С–РЎвЂ“РЎР‹"
                        value={fields.strategyApprovedBy || ''}
                        onChange={(e) => set('strategyApprovedBy', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="">РІР‚вЂќ</MenuItem>
                        {employees.map((emp) => (
                           <MenuItem key={emp._id} value={emp._id}>
                              {emp.fullName || [emp.surname, emp.name].filter(Boolean).join(' ') || emp.name}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        type="date"
                        label="Р вЂќР В°РЎвЂљР В° Р С—Р С•Р С–Р С•Р Т‘Р В¶Р ВµР Р…Р Р…РЎРЏ РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР ВµР С–РЎвЂ“РЎвЂ”"
                        value={fields.strategyApprovedAt || ''}
                        onChange={(e) => set('strategyApprovedAt', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>
               </>
            )}

            {showSaleOptions && (
               <Grid item xs={12}>
                  <TextField
                     label="Р СџРЎР‚Р С‘Р СРЎвЂ“РЎвЂљР С”Р В° Р С—Р С• Р В°Р С”РЎвЂљРЎС“Р В°Р В»РЎРЉР Р…Р С•РЎРѓРЎвЂљРЎвЂ“"
                     placeholder="Р С™Р С•Р СР ВµР Р…РЎвЂљР В°РЎР‚, Р С—РЎР‚Р С‘РЎвЂЎР С‘Р Р…Р В°, Р Т‘Р ВµРЎвЂљР В°Р В»РЎвЂ“..."
                     value={fields.actualityNote}
                     onChange={(e) => set('actualityNote', e.target.value)}
                     fullWidth
                     multiline
                     minRows={2}
                     sx={fieldSx}
                  />
               </Grid>
            )}

            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>
         </Grid>

         {showSaleOptions && originActionBlock}

         <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

         <Grid container spacing={1.6}>
            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>
                  Р ТђР В°РЎР‚Р В°Р С”РЎвЂљР ВµРЎР‚Р С‘РЎРѓРЎвЂљР С‘Р С”Р С‘ Р С•Р В±&apos;РЎвЂќР С”РЎвЂљРЎС“
               </Typography>
            </Grid>

            {showSaleOptions && (
               <Grid item xs={12}>
                  <TextField
                     label="Р СњР В°Р В·Р Р†Р В°"
                     placeholder={titleHint}
                     InputLabelProps={{ shrink: true }}
                     value={fields.title}
                     onChange={(e) => set('title', e.target.value)}
                     fullWidth
                     sx={fieldSx}
                  />
               </Grid>
            )}

            <Grid item xs={12}>
               <TextField
                  label="Р С’Р Т‘РЎР‚Р ВµРЎРѓР В° (РЎР‚РЎРЏР Т‘Р С”Р С•Р С)"
                  placeholder="Р С’Р Т‘РЎР‚Р ВµРЎРѓР В°..."
                  value={fields.location_text}
                  onChange={(e) => set('location_text', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={4}>
               <TextField
                  label="Р СљРЎвЂ“РЎРѓРЎвЂљР С•"
                  value={fields.location.city}
                  onChange={(e) => setLoc('city', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={5}>
               <TextField
                  label="Р вЂ™РЎС“Р В»Р С‘РЎвЂ РЎРЏ"
                  value={fields.location.street}
                  onChange={(e) => setLoc('street', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            <Grid item xs={12} md={3}>
               <TextField
                  label="РІвЂћвЂ“"
                  value={fields.location.number}
                  onChange={(e) => setLoc('number', e.target.value)}
                  fullWidth
                  sx={fieldSx}
               />
            </Grid>

            {showCommerce && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р вЂ™Р С‘Р С”Р С•РЎР‚Р С‘РЎРѓРЎвЂљР В°Р Р…Р Р…РЎРЏ"
                        value={fields.type_using}
                        onChange={(e) => set('type_using', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {USING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р СћР С‘Р С— Р В±РЎС“Р Т‘РЎвЂ“Р Р†Р В»РЎвЂ“"
                        value={fields.type_building}
                        onChange={(e) => set('type_building', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {BUILDING_COMMERCE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р СџРЎвЂ“Р Т‘РЎвЂљР С‘Р С—"
                        value={fields.type_commerce}
                        onChange={(e) => set('type_commerce', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {COMMERCE_SUBTYPE.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showRoomsBlock && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р С™РЎвЂ“Р СР Р…Р В°РЎвЂљ"
                        value={fields.rooms}
                        onChange={(e) => set('rooms', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р вЂ”Р В°Р С–Р В°Р В»РЎРЉР Р…Р В°, Р СР’Р†"
                        value={fields.square_tot}
                        onChange={(e) => set('square_tot', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  {showFlat || showHouse ? (
                     <>
                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Р вЂ“Р С‘РЎвЂљР В»Р С•Р Р†Р В°, Р СР’Р†"
                              value={fields.square_liv}
                              onChange={(e) => set('square_liv', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Р С™РЎС“РЎвЂ¦Р Р…РЎРЏ, Р СР’Р†"
                              value={fields.square_kit}
                              onChange={(e) => set('square_kit', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>
                     </>
                  ) : (
                     <>
                        <Grid item xs={12} md={2}>
                           <TextField
                              label="Р СџР В»Р С•РЎвЂ°Р В° Р Т‘РЎвЂ“Р В»РЎРЏР Р…Р С”Р С‘"
                              value={fields.square_area}
                              onChange={(e) => set('square_area', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                           />
                        </Grid>

                        <Grid item xs={12} md={2}>
                           <TextField
                              select
                              label="Р С›Р Т‘Р С‘Р Р…Р С‘РЎвЂ РЎРЏ"
                              value={fields.area_unit}
                              onChange={(e) => set('area_unit', e.target.value)}
                              fullWidth
                              sx={fieldSx}
                              SelectProps={{ MenuProps: selectMenuProps }}
                           >
                              {AREA_UNITS.map((x) => (
                                 <MenuItem key={x} value={x}>
                                    {x}
                                 </MenuItem>
                              ))}
                           </TextField>
                        </Grid>
                     </>
                  )}
               </>
            )}

            {(showFlat || showCommerce) && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р СџР С•Р Р†Р ВµРЎР‚РЎвЂ¦"
                        value={fields.floor}
                        onChange={(e) => set('floor', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р СџР С•Р Р†Р ВµРЎР‚РЎвЂ¦РЎвЂ“Р Р†"
                        value={fields.floors}
                        onChange={(e) => set('floors', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showHouse && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р СџР В»Р С•РЎвЂ°Р В° Р Т‘РЎвЂ“Р В»РЎРЏР Р…Р С”Р С‘"
                        value={fields.square_area}
                        onChange={(e) => set('square_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р С›Р Т‘Р С‘Р Р…Р С‘РЎвЂ РЎРЏ"
                        value={fields.area_unit}
                        onChange={(e) => set('area_unit', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showFlat && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р СћР С‘Р С— Р В±РЎС“Р Т‘РЎвЂ“Р Р†Р В»РЎвЂ“"
                        value={fields.type_building}
                        onChange={(e) => set('type_building', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {BUILDING_FLAT.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р РЋРЎвЂљРЎвЂ“Р Р…Р С‘"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р вЂР В°Р В»Р С”Р С•Р Р…РЎвЂ“Р Р†"
                        value={fields.balconies}
                        onChange={(e) => set('balconies', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showHouse && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р СћР С‘Р С— Р В±РЎС“Р Т‘Р С‘Р Р…Р С”РЎС“"
                        value={fields.type_house}
                        onChange={(e) => set('type_house', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {HOUSE_TYPES.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р СџР С•Р Р†Р ВµРЎР‚РЎвЂ¦РЎвЂ“Р Р†"
                        value={fields.floors}
                        onChange={(e) => set('floors', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р РЋРЎвЂљРЎвЂ“Р Р…Р С‘"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showCommerce && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р вЂ™Р С‘РЎРѓР С•РЎвЂљР В° РЎРѓРЎвЂљРЎвЂ“Р Р…"
                        value={fields.height_wall}
                        onChange={(e) => set('height_wall', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        helperText="Р СњР В°Р С—РЎР‚. 320"
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р РЋРЎвЂљРЎвЂ“Р Р…Р С‘"
                        value={fields.type_walls}
                        onChange={(e) => set('type_walls', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {WALLS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р С™Р С•РЎР‚Р С‘РЎРѓР Р…Р В°, Р СР’Р†"
                        value={fields.square_use}
                        onChange={(e) => set('square_use', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>
               </>
            )}

            {showLand && (
               <>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Р СџРЎР‚Р С‘Р В·Р Р…Р В°РЎвЂЎР ВµР Р…Р Р…РЎРЏ"
                        value={fields.purpose_area}
                        onChange={(e) => set('purpose_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {PURPOSE_LAND.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р СџР В»Р С•РЎвЂ°Р В°"
                        value={fields.square_area}
                        onChange={(e) => set('square_area', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р С›Р Т‘Р С‘Р Р…Р С‘РЎвЂ РЎРЏ"
                        value={fields.area_unit}
                        onChange={(e) => set('area_unit', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {AREA_UNITS.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            {showSaleOptions && (
               <>
                  <Grid item xs={12} md={2}>
                     <TextField
                        label="Р вЂ™Р В°РЎР‚РЎвЂљРЎвЂ“РЎРѓРЎвЂљРЎРЉ"
                        value={fields.cost}
                        onChange={(e) => set('cost', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField
                        select
                        label="Р вЂ™Р В°Р В»РЎР‹РЎвЂљР В°"
                        value={fields.currency}
                        onChange={(e) => set('currency', e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        SelectProps={{ MenuProps: selectMenuProps }}
                     >
                        {CURRENCIES.map((x) => (
                           <MenuItem key={x} value={x}>
                              {x}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Grid>
               </>
            )}

            <Grid item xs={12}>
               <TextField
                  label="Р С›Р С—Р С‘РЎРѓ"
                  placeholder="Р С›Р С—Р С‘РЎРѓ Р С•Р В±'РЎвЂќР С”РЎвЂљРЎС“ Р Р…Р ВµРЎР‚РЎС“РЎвЂ¦Р С•Р СР С•РЎРѓРЎвЂљРЎвЂ“..."
                  value={fields.description}
                  onChange={(e) => set('description', e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  sx={fieldSx}
               />
            </Grid>

            {/* IMAGES */}
            <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Р В¤Р С•РЎвЂљР С• Р С•Р В±&apos;РЎвЂќР С”РЎвЂљРЎС“
               </Typography>

               <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{
                     mt: 1.5,
                     p: 1.4,
                     borderRadius: 3,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  {/* Р С™Р СњР С›Р СџР С™Р С’ */}
                  <Button
                     component="label"
                     disabled={imgProcessing || loading}
                     startIcon={<PhotoCameraRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        color: '#fff',
                        border: '1px solid rgba(139,92,246,0.35)',
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.22), rgba(168,85,247,0.12))',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        lineHeight: 1,
                        minHeight: 36,
                        minWidth: 150,
                        '&:hover': {
                           background: 'linear-gradient(90deg, rgba(139,92,246,0.30), rgba(168,85,247,0.16))',
                        },
                     }}
                  >
                     Р вЂ”Р В°Р Р†Р В°Р Р…РЎвЂљР В°Р В¶Р С‘РЎвЂљР С‘<br />РЎвЂћР С•РЎвЂљР С•
                     <input hidden type="file" accept="image/*,.heic,.heif" multiple onChange={handleImages} />
                  </Button>

                  {/* SELECT Р вЂњР В Р Р€Р СџР В */}
                  <TextField
                     select
                     size="small"
                     label="Р вЂњРЎР‚РЎС“Р С—Р В° РЎвЂћР С•РЎвЂљР С•"
                     value={fields.photoStage}
                     onChange={(e) => set('photoStage', e.target.value)}
                     sx={{
                        minWidth: 150,
                        ...fieldSx,
                        '& .MuiOutlinedInput-root': {
                           ...fieldSx['& .MuiOutlinedInput-root'],
                           height: 40,
                        },
                     }}
                     SelectProps={{ MenuProps: selectMenuProps }}
                  >
                     {PHOTO_STAGES.map((x) => (
                        <MenuItem key={x.value} value={x.value}>
                           {x.label}
                        </MenuItem>
                     ))}
                  </TextField>

                  {/* Р вЂ Р СњР В¤Р С› */}
                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.70)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                     }}
                  >
                     Р С›Р В±РЎР‚Р В°Р Р…Р С•: <b style={{ color: '#fff' }}>{fields.images.length}</b> / {MAX_FILES}
                  </Typography>

                  {/* Р В Р С›Р вЂ”Р СћР Р‡Р вЂњР Р€Р вЂ™Р С’Р В§ */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* META CHIP */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     {imgMeta.slice(0, 3).map((m, idx) => (
                        <Chip
                           key={idx}
                           label={`${m.name} РІР‚Сћ ${formatBytes(m.after)}`}
                           size="small"
                           sx={{
                              bgcolor: m.ok ? 'rgba(255,255,255,0.04)' : 'rgba(255, 82, 82, 0.10)',
                              border: m.ok
                                 ? '1px solid rgba(255,255,255,0.10)'
                                 : '1px solid rgba(255, 82, 82, 0.28)',
                              color: 'rgba(255,255,255,0.88)',
                              maxWidth: 220,
                           }}
                        />
                     ))}

                     {imgMeta.length > 3 && (
                        <Chip
                           label={`+${imgMeta.length - 3}`}
                           size="small"
                           sx={{
                              bgcolor: 'rgba(139,92,246,0.18)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              color: '#fff',
                           }}
                        />
                     )}
                  </Stack>
               </Stack>


               {imgProcessing && (
                  <Alert
                     severity="info"
                     icon={<CircularProgress size={18} sx={{ color: 'rgba(147,197,253,0.95)' }} />}
                     sx={{
                        mt: 1.2,
                        bgcolor: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.22)',
                        color: 'rgba(255,255,255,0.92)',
                        borderRadius: 3,
                        '& .MuiAlert-icon': {
                           color: 'rgba(147,197,253,0.95)',
                           alignItems: 'center',
                        },
                     }}
                  >
                     {imgProcessingText || 'Р С™Р С•Р Р…Р Р†Р ВµРЎР‚РЎвЂљР В°РЎвЂ РЎвЂ“РЎРЏ РЎвЂљР В° РЎРѓРЎвЂљР С‘РЎРѓР С”Р В°Р Р…Р Р…РЎРЏ РЎвЂћР С•РЎвЂљР С•...'}
                  </Alert>
               )}


               {imgWarn && (
                  <Alert
                     severity="warning"
                     sx={{
                        mt: 1.2,
                        bgcolor: 'rgba(255, 193, 7, 0.08)',
                        border: '1px solid rgba(255, 193, 7, 0.25)',
                        color: 'rgba(255,255,255,0.9)',
                        borderRadius: 3,
                        '& .MuiAlert-icon': { color: 'rgba(255, 193, 7, 0.9)' },
                     }}
                  >
                     {imgWarn}
                  </Alert>
               )}

               {!!fields.images.length && (
                  <Grid container spacing={1.2} sx={{ mt: 1 }}>
                     {fields.images.map((img, idx) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4}
                           //  key={`${img.file?.name || 'img'}-${idx}`}
                           key={`${img.public_id || img.url || img.file?.name || 'img'}-${idx}`}
                        >
                           <Box
                              sx={{
                                 border: img.isMain
                                    ? '2px solid rgba(168,85,247,0.95)'
                                    : '1px solid rgba(255,255,255,0.10)',
                                 borderRadius: 3,
                                 overflow: 'hidden',
                                 bgcolor: 'rgba(255,255,255,0.03)',
                                 boxShadow: img.isMain ? '0 0 0 2px rgba(139,92,246,0.18)' : 'none',
                              }}
                           >
                              <Box
                                 component="img"
                                 // src={img.preview}
                                 src={
                                    img.preview ||
                                    img.url ||
                                    img.variants?.preview ||
                                    img.processedUrl ||
                                    img.brandedUrl ||
                                    '/no-image.png'
                                 }
                                 alt={`preview-${idx}`}
                                 sx={{
                                    width: '100%',
                                    aspectRatio: '4 / 3',
                                    objectFit: 'cover',
                                    display: 'block',
                                 }}
                              />

                              <Stack spacing={0.8} sx={{ p: 1.1 }}>
                                 <Typography
                                    sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}
                                    noWrap
                                    title={img.file?.name || ''}
                                 >
                                    {img.file?.name || `Р В¤Р С•РЎвЂљР С• ${idx + 1}`}
                                 </Typography>

                                 <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                    <Chip
                                       label={getPhotoStageLabel(img.stage)}
                                       size="small"
                                       sx={{
                                          bgcolor: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          color: '#fff',
                                       }}
                                    />

                                    {img.isMain && (
                                       <Chip
                                          label="Р вЂњР С•Р В»Р С•Р Р†Р Р…Р Вµ"
                                          size="small"
                                          sx={{
                                             bgcolor: 'rgba(139,92,246,0.20)',
                                             border: '1px solid rgba(139,92,246,0.35)',
                                             color: '#fff',
                                          }}
                                       />
                                    )}
                                 </Stack>

                                 <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                                    {formatBytes(img.file?.size || 0)}
                                 </Typography>

                                 <Stack direction="row" spacing={0.8}>
                                    <Button
                                       size="small"
                                       onClick={() => setMainImage(idx)}
                                       sx={{
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11,
                                          color: '#fff',
                                          border: '1px solid rgba(255,255,255,0.10)',
                                          borderRadius: 2,
                                       }}
                                    >
                                       {img.isMain ? 'Р вЂњР С•Р В»Р С•Р Р†Р Р…Р Вµ' : 'Р вЂ”РЎР‚Р С•Р В±Р С‘РЎвЂљР С‘ Р С–Р С•Р В»Р С•Р Р†Р Р…Р С‘Р С'}
                                    </Button>

                                    <Button
                                       size="small"
                                       onClick={() => removeImage(idx)}
                                       sx={{
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11,
                                          color: '#ffb4b4',
                                          border: '1px solid rgba(255, 82, 82, 0.24)',
                                          borderRadius: 2,
                                       }}
                                    >
                                       Р вЂ™Р С‘Р Т‘Р В°Р В»Р С‘РЎвЂљР С‘
                                    </Button>
                                 </Stack>
                              </Stack>
                           </Box>
                        </Grid>
                     ))}
                  </Grid>
               )}
            </Grid>



            <Grid item xs={12}>
               <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                     <DynamicListField
                        title="Р СџР ВµРЎР‚Р ВµР Р†Р В°Р С–Р С‘"
                        value={fields.advantages}
                        onChange={(val) => set('advantages', val)}
                        fieldSx={fieldSx}
                        placeholder="РЎвЂ Р ВµР Р…РЎвЂљРЎР‚, Р Р…Р С•Р Р†Р С‘Р в„– РЎР‚Р ВµР СР С•Р Р…РЎвЂљ, Р Р†Р С‘Р С–Р В»РЎРЏР Т‘..."
                     />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <DynamicListField
                        title="Р СњР ВµР Т‘Р С•Р В»РЎвЂ“Р С”Р С‘"
                        value={fields.disadvantages}
                        onChange={(val) => set('disadvantages', val)}
                        fieldSx={fieldSx}
                        placeholder="РЎв‚¬РЎС“Р СР Р…Р В° Р Р†РЎС“Р В»Р С‘РЎвЂ РЎРЏ, Р В±Р ВµР В· Р В»РЎвЂ“РЎвЂћРЎвЂљР В°..."
                     />
                  </Grid>
               </Grid>
            </Grid>







            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>

            {/* <Grid item xs={12}>
               <Typography sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                  Р С™Р С•Р Р…РЎвЂљР В°Р С”РЎвЂљР С‘
               </Typography>
            </Grid> */}


            {isRentObject && (
               <Grid item xs={12}>
                  <RentOptionsSection
                     statusRent={fields.statusRent}
                     value={fields.rentOptions}
                     onStatusChange={(val) => set('statusRent', val)}
                     onChange={setRentOptions}
                     fieldSx={fieldSx}
                     selectMenuProps={selectMenuProps}
                  />
               </Grid>
            )}

            <Grid item xs={12}>
               <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
               <OwnersSection
                  value={fields.owners}
                  onChange={setOwners}
                  fieldSx={fieldSx}
                  selectMenuProps={selectMenuProps}
               />
            </Grid>




            <Grid item xs={12}>
               <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                     onClick={onCancel}
                     sx={{
                        borderRadius: 3,
                        color: 'rgba(255,255,255,0.75)',
                        border: '1px solid rgba(255,255,255,0.12)',
                     }}
                  >
                     Р РЋР С”Р В°РЎРѓРЎС“Р Р†Р В°РЎвЂљР С‘
                  </Button>

                  <Button
                     type="submit"
                     disabled={loading || imgProcessing}
                     variant="contained"
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        px: 2.5,
                        color: '#0b0b12',
                        background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                        boxShadow: '0 16px 35px rgba(139,92,246,0.35)',
                        '&:hover': { boxShadow: '0 22px 45px rgba(139,92,246,0.48)' },
                     }}
                  >
                     {imgProcessing
                        ? 'Р С›Р В±РЎР‚Р С•Р В±Р С”Р В° РЎвЂћР С•РЎвЂљР С•...'
                        : loading
                           ? 'Р вЂ”Р В±Р ВµРЎР‚Р ВµР В¶Р ВµР Р…Р Р…РЎРЏ...'
                           : 'Р вЂ”Р В±Р ВµРЎР‚Р ВµР С–РЎвЂљР С‘ Р С•Р В±РІР‚в„ўРЎвЂќР С”РЎвЂљ'}
                  </Button>
               </Stack>
            </Grid>
         </Grid>
      </Box>
   );
}
